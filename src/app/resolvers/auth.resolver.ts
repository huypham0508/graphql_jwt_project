import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Bcrypt } from "../bcrypt/index";
import { ConfigJWT, Otp, Role } from "../config/config";
import {
  AuthMiddleware,
  VerifyTokenAll,
  VerifyTokenForgotPassword,
} from "../middleware/auth";
import User, { IUser } from "../models/user/user.model";

import generateOTP from "../utils/generate_otp";

import { ApolloError } from "apollo-server-core";
import RoleModel from "../models/role/role.model";
import { Context } from "../types/Context";
import { LoginInput } from "../types/input/user/LoginInput";
import { RegisterInput } from "../types/input/user/RegisterInput";
import { UpdateUserInput } from "../types/input/user/UpdateUserInput";
import { ForgotPasswordResponse } from "../types/response/auth/ForgotPasswordResponse";
import { UserMutationResponse } from "../types/response/user/UserMutationResponse";
import { TokenPayLoad } from "../types/TokenPayload";
import sendEmail from "../utils/send_email";

@Resolver()
export class AuthResolver {
  @Query((_return) => [IUser])
  @UseMiddleware(VerifyTokenAll)
  async getUsers(@Ctx() _: Context): Promise<IUser[]> {
    const data = await User.find();
    return data;
  }

  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput")
    registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const { email, userName, password, avatar } = registerInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: "Email already exists!!!",
      };
    }

    const defaultRole = await RoleModel.findOne({ name: "member" });

    const hashedPassword = await Bcrypt.hashPassword(password);
    const newUser = new User({
      email,
      userName,
      password: hashedPassword,
      avatar: avatar,
      otp: undefined,
      otpExpirationTime: undefined,
      role: defaultRole,
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
    console.log("login is working...", email);
    const checkAccount = await User.findOne({
      email,
    });

    if (!checkAccount) {
      return {
        code: 400,
        success: false,
        message: "Email not found!!!",
      };
    }

    let hashPassword = checkAccount?.password ?? "";
    const checkPassword = await Bcrypt.comparePassword(password, hashPassword);

    if (!checkPassword) {
      return {
        code: 400,
        success: false,
        message: "Password error!!!",
      };
    }

    const userModel: TokenPayLoad = {
      id: checkAccount.id,
      email: checkAccount.email,
      userName: checkAccount.userName,
      tokenPermissions: Role.ALL,
      role: checkAccount.role,
    };



    const refreshToken = AuthMiddleware.sendRefreshToken(res, userModel);

    return {
      code: 200,
      success: true,
      message: "Logged in successfully!!!",
      accessToken: AuthMiddleware.createToken(ConfigJWT.create_token_type, userModel),
      refreshToken: refreshToken ?? "",
      user: {
        id: checkAccount._id,
        email: checkAccount.email,
        userName: checkAccount.userName,
        password: "",
        avatar: checkAccount.avatar,
        role: checkAccount.role
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

    sendEmail(mailOptions);
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
        message: "OTP not match",
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

    const tokenPayLoad: TokenPayLoad = {
      id: user._id,
      email: user.email,
      userName: user.userName,
      tokenPermissions: Role.FORGOT_PASSWORD,
      role: user.role
    };

    const token = AuthMiddleware.createToken(ConfigJWT.create_token_type, tokenPayLoad);

    return {
      code: 200,
      success: true,
      accessToken: token,
      message: "OTP submitted successfully.",
    };
  }

  @UseMiddleware(VerifyTokenForgotPassword)
  @Mutation((_return) => ForgotPasswordResponse)
  async resetPassword(
    @Arg("newPassword") newPassword: string,
    @Ctx() { user: payloadVerify }: Context
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email: payloadVerify.email });

    if (!user) {
      throw new ApolloError("Email not found.", "EMAIL_NOT_FOUND");
    }

    try {
      const hashedPassword = await Bcrypt.hashPassword(newPassword);

      await User.updateOne(
        { _id: user.id, email: payloadVerify.email },
        {
          password: hashedPassword,
        }
      );
      return {
        code: 200,
        success: true,
        message: "Password reset successfully.",
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw new ApolloError(
        "Failed to reset password.",
        "RESET_PASSWORD_FAILED"
      );
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async logout(
    @Arg("id", (_type) => ID) id: any,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
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

  @UseMiddleware(VerifyTokenAll)
  @Mutation((_return) => UserMutationResponse)
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
