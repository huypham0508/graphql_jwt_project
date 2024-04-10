import { Router } from "express";
import { ConfigJWT, Role } from "../config/config";
import { Secret, verify } from "jsonwebtoken";
import { UserAuthPayload } from "../types/UserAuthPayload";
import User from "../models/user/User";
import { Auth } from "../middleware/auth";
import { TokenPayLoad } from "../types/TokenPayload";

const refreshToken = Router();

refreshToken.get("/", async (req, res): Promise<any> => {
  console.log("sending refresh token...");
  const nameCookie = ConfigJWT.REFRESH_TOKEN_COOKIE_NAME;
  const refreshToken = await req?.cookies[nameCookie];
  console.log("refreshing token" + refreshToken);

  if (!refreshToken) {
    return res.status(403).json({
      success: false,
      message: "No refresh token found",
    });
  }
  try {
    const decoded = verify(
      refreshToken,
      ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret
    ) as UserAuthPayload;

    const existingUser = await User.findOne({
      _id: decoded.id,
    });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (decoded.tokenVersion !== existingUser.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token Version exp",
      });
    }

    const tokenPayload: TokenPayLoad = {
      id: existingUser._id,
      email: existingUser.email,
      userName: existingUser.userName,
      tokenVersion: existingUser.tokenVersion ?? 0,
      role: Role.ALL,
    };

    Auth.sendRefreshToken(res, tokenPayload);

    return res.status(200).json({
      success: true,
      message: "Successfully!!!",
      accessToken: Auth.createToken(ConfigJWT.create_token_type, {
        id: existingUser._id,
        email: existingUser.email,
        userName: existingUser.userName,
        password: "",
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
});
export default refreshToken;
