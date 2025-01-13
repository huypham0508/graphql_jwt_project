import { Request, Response } from "express";
import { Secret, verify } from "jsonwebtoken";

import { ConfigJWT, Role } from "../config/config";
import { UserAuthPayload } from "../types/UserAuthPayload";
import User from "../models/user/user.model";
import { Auth } from "../middleware/auth";
import { TokenPayLoad } from "../types/TokenPayload";

const handleRefreshToken = async (req: Request, res: Response): Promise<any> => {
    console.log("sending refresh token...");
    const nameCookie = ConfigJWT.REFRESH_TOKEN_COOKIE_NAME;
    let refreshToken = await req?.cookies[nameCookie];
    if (!refreshToken) {
        refreshToken = req.header(nameCookie);
    }

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

        const newRefreshToken = Auth.sendRefreshToken(res, tokenPayload);
        return res.status(200).json({
            success: true,
            message: "Successfully!!!",
            accessToken: Auth.createToken(ConfigJWT.create_token_type, tokenPayload),
            newRefreshToken,
        });
    } catch (error) {
            console.log(error);
            return res.status(403).json({
            success: false,
            message: "error" + error,
        });
  }
};


export { handleRefreshToken };
