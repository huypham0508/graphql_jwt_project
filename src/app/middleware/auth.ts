import { ApolloError, AuthenticationError } from "apollo-server-express";
import { Response } from "express";
import { Secret, sign, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { ConfigJWT, Role } from "../config/config";
import User, { IUser } from "../models/user/User";
import { Context } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";

export class Auth {
  public static createToken = (type: ConfigJWT, user: any) => {
    // console.log("creating new token...");
    const checkType = type === ConfigJWT.create_token_type;

    let token = sign(
      user,
      checkType
        ? (ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret)
        : (ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret),
      { expiresIn: checkType ? "1m" : "10m" }
    );

    return token ?? "";
  };
  public static sendRefreshToken = (res: Response, user: IUser) => {
    // console.log("sending refresh token...");

    const token = Auth.createToken(ConfigJWT.refresh_token_type, user);

    res.cookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "refreshToken",
    });
    return token;
  };

  public static verifyToken =
    (requiredRole: string): MiddlewareFn<Context> =>
    async ({ context }, next) => {
      const authHeader = context.req.header("Authorization");
      const assetToken = authHeader && authHeader.split(" ")[1];

      try {
        if (!assetToken && assetToken !== "") {
          throw new AuthenticationError("No token provided");
        }

        const decodedToken = verify(
          assetToken,
          ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret
        ) as UserAuthPayload;

        if (decodedToken.role === requiredRole) {
          const data = await User.findOne({
            _id: decodedToken.id,
            email: decodedToken.email,
          });

          if (!data) {
            throw new AuthenticationError("Data not found");
          }
          if (data && data.tokenVersion != decodedToken.tokenVersion) {
            throw new AuthenticationError("Token version not match");
          }

          context.user = decodedToken;
          return next();
        }
        throw new AuthenticationError("Unauthorized");
      } catch (error) {
        throw new ApolloError("Unauthorized", error);
      }
    };
}

const verifyTokenForgotPassword = Auth.verifyToken(Role.FORGOT_PASSWORD);

const verifyTokenAll = Auth.verifyToken(Role.ALL);

export { verifyTokenAll, verifyTokenForgotPassword };
