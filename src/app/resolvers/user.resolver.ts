import User, { IUser } from "../models/user/User";
import { RegisterInput } from "../types/input/user/RegisterInput";
import {
  Arg,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { UserMutationResponse } from "../types/response/user/UserMutationResponse";
import { LoginInput } from "../types/input/user/LoginInput";
import { Bcrypt } from "../bcrypt/index";
import { Auth } from "../middleware/auth";
import { Context } from "../types/Context";
import { ConfigJWT } from "../config/config";

@Resolver()
export class UserResolver {
  @Query((_return) => [IUser])
  @UseMiddleware(Auth.verifyToken)
  async getUser(): Promise<IUser[]> {
    const data = await User.find();
    return data;
  }
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput")
    registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    console.log("register is working...");
    const { email, userName, password } = registerInput;
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
      tokenVersion: 0,
    });
    await newUser.save();
    return {
      code: 200,
      success: true,
      message: "User registered successfully!!!",
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
    hashPassword = await checkAccount.password;
    const checkPassword = await Bcrypt.comparePassword(password, hashPassword);
    if (!checkPassword) {
      return {
        code: 400,
        success: false,
        message: "Password error!!!",
      };
    }
    Auth.sendRefreshToken(res, {
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
      // tokenVersion: checkAccount.tokenVersion,
      password: "",
    };
    return {
      code: 200,
      success: true,
      message: "Logged in successfully!!!",
      accessToken:
        Auth.createToken(ConfigJWT.create_token_type, userModel) ?? "",
      user: {
        id: checkAccount._id,
        email: checkAccount.email,
        userName: checkAccount.userName,
        // tokenVersion: checkAccount.tokenVersion,
        password: "checkAccount.password",
      },
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
    existingUser.tokenVersion = await versionPlus;
    existingUser.token = await "";
    await existingUser.save();
    //clear cookie
    await res.clearCookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, {
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
}
