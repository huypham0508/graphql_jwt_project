import { Secret, sign, verify } from "jsonwebtoken";
import { IUser } from "../models/User";
import { ConfigJWT } from "../config/config";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-express";
import { UserAuthPayload } from "../types/UserAuthPayload";

export class Auth {
    public static createToken = (user: IUser) => {
        return sign(
            {
                id: user.id,
                username: user.userName
            },
            ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret,
            {
                expiresIn: "15m"
            }
        )
    }
    public static verifyToken: MiddlewareFn<Context> = ({ context }, next) => {
        try {
            const authHeader = context.req.header('Authorization');
            const assetToken = authHeader && authHeader.split(" ")[1];
            if (!assetToken) {
                throw new AuthenticationError("No token provided");
            }
            const decodedToken = verify(assetToken, ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret) as UserAuthPayload;
            if (!decodedToken) {
                throw new AuthenticationError("Invalid token");
            }
            context.user = decodedToken;
            return next();
        } catch (error) {
            throw new AuthenticationError("Error while verifying token", error);
        }
    }
}