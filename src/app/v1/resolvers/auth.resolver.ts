import { ApolloError } from "apollo-server-core";
import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Bcrypt } from "../../core/bcrypt/index";
import { ConfigJWT, Otp, Role } from "../../config";
import {
  AuthMiddleware,
  VerifyTokenAll,
  VerifyTokenForgotPassword,
} from "../../core/middleware/auth";
import User, { IUser } from "../../core/models/user/user.model";

import generateOTP from "../../core/utils/generate_otp";

import RoleModel from "../../core/models/role/role.model";
import { Context } from "../../core/types/Context";
import { LoginInput } from "../../core/types/input/user/LoginInput";
import { RegisterInput } from "../../core/types/input/user/RegisterInput";
import { UpdateUserInput } from "../../core/types/input/user/UpdateUserInput";
import { ForgotPasswordResponse } from "../../core/types/response/auth/ForgotPasswordResponse";
import { UserMutationResponse } from "../../core/types/response/user/UserMutationResponse";
import { TokenPayLoad } from "../../core/types/TokenPayload";
import sendEmail from "../../core/utils/send_email";

@Resolver()
export class AuthResolver {
  @Query((_return) => String)
  @UseMiddleware(VerifyTokenAll)
  async hello(@Ctx() context: Context): Promise<String> {
    const id = context.user.id;
    const data = await User.findOne({
      _id: id,
    });

    if (!data) {
      return `data not found`;
    }
    return `hello ${data.userName ?? "world"}`;
  }

  @Query((_return) => [IUser])
  @UseMiddleware(VerifyTokenAll)
  async getUsers(@Ctx() _: Context): Promise<IUser[]> {
    const data = await User.find();
    return data;
  }

  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput")
    registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {

    const { email, userName, password, avatar } = registerInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: req.t("Email already exists!"),
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
      message: req.t("User registered successfully!"),
      user: newUser,
    };
  }


  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput")
    { email, password }: LoginInput,
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
    console.log("login is working...", email);
    const checkAccount = await User.findOne({
      email,
    });

    if (!checkAccount) {
      return {
        code: 400,
        success: false,
        message: req.t("Email not found!"),
      };
    }

    let hashPassword = checkAccount?.password ?? "";
    const checkPassword = await Bcrypt.comparePassword(password, hashPassword);

    if (!checkPassword) {
      return {
        code: 400,
        success: false,
        message: req.t("Password error!"),
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
      message: req.t("Logged in successfully!"),
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
    @Arg("email") email: string,
    @Ctx() { req }: Context
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        code: 400,
        success: false,
        message: req.t("Email not found!"),
      };
    }

    const otp = generateOTP();

    const mailOptions = {
      to: email,
      subject: req.t("Password Reset OTP"),
      text: req.t("Your OTP for password reset is: {{otp}}", {otp: otp}),
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
      message: req.t("OTP sent to your email. Please check your inbox."),
    };
  }

  @Mutation((_return) => ForgotPasswordResponse)
  async submitOTP(
    @Arg("email") email: string,
    @Arg("otp") otp: string,
    @Ctx() { req }: Context
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        code: 400,
        success: false,
        message: req.t("Email not found!"),
      };
    }

    if (user.otp !== otp) {
      return {
        code: 400,
        success: false,
        message: req.t("OTP not match"),
      };
    }
    const dateNow = Date.now();
    if (dateNow > user.otpExpirationTime!) {
      return {
        code: 400,
        success: false,
        message: req.t("OTP expired"),
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
      message: req.t("OTP submitted successfully."),
    };
  }

  @UseMiddleware(VerifyTokenForgotPassword)
  @Mutation((_return) => ForgotPasswordResponse)
  async resetPassword(
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, user: payloadVerify }: Context
  ): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ email: payloadVerify.email });

    if (!user) {
      throw new ApolloError(req.t("User not found!"));
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
        message: req.t("Password reset successfully."),
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
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
    const existingUser = await User.findOne({
      _id: id,
    });
    if (!existingUser) {
      return {
        code: 401,
        success: true,
        message: req.t("User not found!"),
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
      message: req.t("Logged out successfully!"),
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
          message: context.req.t("User not found!"),
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
        message: context.req.t("User updated successfully"),
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
