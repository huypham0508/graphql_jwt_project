import { Arg, Ctx, ID, Mutation, Resolver, UseMiddleware } from "type-graphql";

import { Bcrypt } from "../bcrypt/index";
import { ConfigJWT, Otp } from "../config/config";
import { Auth } from "../middleware/auth";
import User, { IUser } from "../models/user/User";

import generateOTP from "../utils/generateOTP";
import sendEmail from "../utils/sendEmail";

import { Context } from "../types/Context";
import { LoginInput } from "../types/input/user/LoginInput";
import { RegisterInput } from "../types/input/user/RegisterInput";
import { ForgotPasswordResponse } from "../types/response/auth/ForgotPasswordResponse";
import { UserMutationResponse } from "../types/response/user/UserMutationResponse";
import { UpdateUserInput } from "../types/input/user/UpdateUserInput";

@Resolver()
export class AuthResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput")
    registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    console.log("register is working...");
    const { email, userName, password, avatar } = registerInput;
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: "Email already exists!!!",
      };
    }
    const hashedPassword = await Bcrypt.hashPassword(password);
    const newUser = new User({
      email,
      userName,
      password: hashedPassword,
      avatar: avatar,
      tokenVersion: 0,
      otp: null,
      otpExpirationTime: null,
    });
    await newUser.save();
    return {
      code: 200,
      success: true,
      message: "User registered successfully!!!",
      user: newUser,
    };
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput")
    { email, password }: LoginInput,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
    console.log("login is working...");

    let hashPassword = "";
    const checkAccount = await User.findOne({
      email,
    });
    //check email
    if (!checkAccount) {
      return {
        code: 400,
        success: false,
        message: "Email error!!!",
      };
    }
    //check password
    hashPassword = checkAccount.password;
    const checkPassword = await Bcrypt.comparePassword(password, hashPassword);
    if (!checkPassword) {
      return {
        code: 400,
        success: false,
        message: "Password error!!!",
      };
    }
    const refreshToken = Auth.sendRefreshToken(res, {
      id: checkAccount._id,
      email: checkAccount.email,
      userName: checkAccount.userName,
      tokenVersion: checkAccount.tokenVersion,
      password: "",
    });
    const userModel: IUser = {
      id: checkAccount._id,
      email: checkAccount.email,
      userName: checkAccount.userName,
      password: "",
    };
    return {
      code: 200,
      success: true,
      message: "Logged in successfully!!!",
      accessToken: Auth.createToken(ConfigJWT.create_token_type, userModel),
      refreshToken: refreshToken ?? "",
      user: {
        id: checkAccount._id,
        email: checkAccount.email,
        userName: checkAccount.userName,
        password: "checkAccount.password",
        avatar: checkAccount.avatar,
        // tokenVersion: checkAccount.tokenVersion,
      },
    };
  }

  @Mutation((_return) => ForgotPasswordResponse)
  async forgotPassword(
    @Arg("email") email: string
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        code: 400,
        success: false,
        message: "Email not found.",
      };
    }

    const otp = generateOTP();

    const mailOptions = {
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    await sendEmail(mailOptions);
    const expirationTime = Date.now() + Otp.EXPIRATION_TIME;

    await User.updateOne(
      { _id: user.id, email: email },
      { otp: otp, otpExpirationTime: expirationTime }
    );

    return {
      code: 200,
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
    };
  }

  @Mutation((_return) => ForgotPasswordResponse)
  async submitOTP(
    @Arg("email") email: string,
    @Arg("otp") otp: string
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        code: 400,
        success: false,
        message: "Email not found.",
      };
    }

    if (user.otp !== otp) {
      return {
        code: 400,
        success: false,
        message: "Invalid OTP.",
      };
    }
    const dateNow = Date.now();
    if (dateNow > user.otpExpirationTime!) {
      return {
        code: 400,
        success: false,
        message: "OTP expired",
      };
    }

    await User.updateOne(
      { _id: user.id, email: email },
      { otp: null, otpExpirationTime: null }
    );

    return {
      code: 200,
      success: true,
      message: "OTP submitted successfully.",
    };
  }

  @Mutation((_return) => ForgotPasswordResponse)
  async resetPassword(
    @Arg("email") email: string,
    @Arg("newPassword") newPassword: string
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        code: 400,
        success: false,
        message: "Email not found.",
      };
    }

    const hashedPassword = await Bcrypt.hashPassword(newPassword);

    await User.updateOne(
      { _id: user.id, email: email },
      { password: hashedPassword }
    );

    return {
      code: 200,
      success: true,
      message: "Password reset successfully.",
    };
  }

  @Mutation((_return) => UserMutationResponse)
  async logout(
    @Arg("id", (_type) => ID) id: any,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
    console.log("logout is working...");
    const existingUser = await User.findOne({
      _id: id,
    });
    if (!existingUser) {
      return {
        code: 401,
        success: true,
        message: "Error !!!",
      };
    }
    const versionPlus =
      existingUser.tokenVersion !== undefined
        ? existingUser.tokenVersion + 1
        : 0;
    existingUser.tokenVersion = versionPlus;
    existingUser.token = "";
    await existingUser.save();
    //clear cookie
    res.clearCookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/refresh_token",
    });
    return {
      code: 200,
      success: true,
      message: "Logged out successfully!!!",
    };
  }

  @Mutation((_return) => UserMutationResponse)
  @UseMiddleware(Auth.verifyToken)
  async updateUser(
    @Arg("updateUserInput") updateUserInput: UpdateUserInput,
    @Ctx() context: Context
  ): Promise<UserMutationResponse> {
    try {
      const { username, avatar } = updateUserInput;
      const existingUser = await User.findById(context.user.id);

      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: "User not found",
        };
      }

      if (username) {
        existingUser.userName = username;
      }

      if (avatar) {
        existingUser.avatar = avatar;
      }

      await existingUser.save();

      return {
        code: 200,
        success: true,
        message: "User updated successfully",
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }
}
// @Query((_return) => [IUser])
// async getUser(): Promise<IUser[]> {
//   const data = await User.find();
//   return data;
// }
// @UseMiddleware(Auth.verifyToken)
