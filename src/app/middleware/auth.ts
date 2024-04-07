import { AuthenticationError } from "apollo-server-express";
import { Response } from "express";
import { Secret, sign, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { ConfigJWT } from "../config/config";
import User, { IUser } from "../models/user/User";
import { Context } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";

export class Auth {
  public static createToken = (type: ConfigJWT, user: IUser) => {
    // console.log("creating new token...");
    const checkType = type === ConfigJWT.create_token_type;
    let token = sign(
      user,
      checkType
        ? (ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret)
        : (ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret),
      { expiresIn: type === checkType ? "15m" : "60m" }
    );
    // User.updateOne({ _id: user.id, userName: user.userName }, { token: token })
    //   .then(() => {
    //     return token;
    //   })
    //   .catch(() => {
    //     return (token = "");
    //   });
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
  public static verifyToken: MiddlewareFn<Context> = async (
    { context },
    next
  ) => {
    // console.log("verifying token...");
    try {
      const authHeader = context.req.header("Authorization");
      const assetToken = authHeader && authHeader.split(" ")[1];

      if (!assetToken && assetToken !== "") {
        throw new AuthenticationError("No token provided");
      }

      const decodedToken = verify(
        assetToken,
        ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret
      ) as UserAuthPayload;

      return User.findOne({
        _id: decodedToken.id,
        email: decodedToken.email,
      })
        .then((data) => {
          if (!data) {
            return new AuthenticationError("Data not found");
          }
          if (data.tokenVersion != decodedToken.tokenVersion) {
            return new AuthenticationError("Token version not match");
          }

          context.user = decodedToken;
          next();
          return true;
        })
        .catch(() => {
          throw new AuthenticationError("Token error");
        });
    } catch (error) {
      throw new AuthenticationError("Error while verifying token", error);
    }
  };
}
