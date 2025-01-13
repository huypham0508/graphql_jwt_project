import { AuthenticationError } from "apollo-server-express";
import { NextFunction, Response } from "express";
import { Secret, sign, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";

import { ConfigJWT, Role } from "../config/config";

import User, { IUser } from "../models/user/user.model";

import { Context, CustomRequest } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";

class Auth {
  public static createToken = (type: ConfigJWT, user: any) => {
    // console.log("creating new token...");
    const checkType = type === ConfigJWT.create_token_type;

    let token = sign(
      user,
      checkType
        ? (ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret)
        : (ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret),
      { expiresIn: checkType ? "1d" : "7d" }
    );

    return token ?? "";
  };
  public static sendRefreshToken = (res: Response, user: IUser) => {
    console.log("sending refresh token...");
    const token = this.createToken(ConfigJWT.refresh_token_type, user);
    res.cookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "refreshToken",
    });
    return token;
  };

  public static verifyToken = (requiredRole: string): MiddlewareFn<Context> => async ({ context }, next) => {
    const authHeader = context.req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) throw new AuthenticationError("No token provided");

    const decodedToken = this.decodeAndVerifyToken(token, requiredRole);

    const user = await this.findUser(decodedToken);
    if (!user) throw new AuthenticationError("User not found");

    context.user = decodedToken;
    return next();
  };

  public static verifyTokenRest = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization?.toString();
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
      const decodedToken = this.decodeAndVerifyToken(token, Role.ALL);
      const user = this.findUser(decodedToken);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      req.user = decodedToken;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };

  private static decodeAndVerifyToken = (
    token: string,
    requiredRole: string
  ): UserAuthPayload => {
    try {
      const decoded = verify(
        token,
        ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret
      ) as UserAuthPayload;

      if (decoded.role !== requiredRole) {
        throw new AuthenticationError("Unauthorized role");
      }

      return decoded;
    } catch (error) {
      throw new AuthenticationError("Invalid token");
    }
  };

  private static findUser = async (decodedToken: UserAuthPayload) => {
    return User.findOne({
      _id: decodedToken.id,
      email: decodedToken.email,
      tokenVersion: decodedToken.tokenVersion,
    });
  };
}



const verifyTokenForgotPassword = Auth.verifyToken(Role.FORGOT_PASSWORD);
const verifyTokenAll = Auth.verifyToken(Role.ALL);


export { Auth, verifyTokenAll, verifyTokenForgotPassword };

