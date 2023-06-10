import { Secret, sign, verify } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { ConfigJWT } from "../config/config";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-express";
import { UserAuthPayload } from "../types/UserAuthPayload";
import { Response } from "express";

export class Auth {
    public static createToken = (type: ConfigJWT, user: IUser) => {
        console.log("creating new token...");
        const checkType = type === ConfigJWT.create_token_type;
        let token = sign(user,
            checkType ? ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret : ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret,
            { expiresIn: type === checkType ? "15m" : "60m" }
        )
        User.updateOne({ _id: user.id, userName: user.userName }, { token: token })
            .then(() => {
                return token;
            })
            .catch(() => {
                return token = "";
            })
        return token;
    }
    public static sendRefreshToken = (res: Response, user: IUser) => {
        console.log("sending refresh token...");

        const token = Auth.createToken(ConfigJWT.refresh_token_type, user,)
        res.cookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME,
            token,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/refresh_token',
            }
        )
    }
    public static verifyToken: MiddlewareFn<Context> = ({ context }, next) => {
        console.log("verifying token...");
        try {
            const authHeader = context.req.header('Authorization');
            const assetToken = authHeader && authHeader.split(" ")[1];

            if (!assetToken && assetToken !== "") {
                throw new AuthenticationError("No token provided");
            }
            return User.findOne({
                token: assetToken
            }).then((data) => {
                if (!data) {
                    throw new AuthenticationError("token not found");
                }
                const decodedToken = verify(assetToken, ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret) as UserAuthPayload;
                if (!decodedToken) {
                    throw new AuthenticationError("Invalid token");
                }
                context.user = decodedToken;
                return next();
            }).catch(() => {
                throw new AuthenticationError("token not found");
            })
        } catch (error) {
            throw new AuthenticationError("Error while verifying token", error);
        }
    }
}