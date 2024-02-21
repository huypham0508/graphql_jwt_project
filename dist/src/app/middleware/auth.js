"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = __importDefault(require("../models/user/User"));
const config_1 = require("../config/config");
const apollo_server_express_1 = require("apollo-server-express");
class Auth {
}
exports.Auth = Auth;
Auth.createToken = (type, user) => {
    console.log("creating new token...");
    const checkType = type === config_1.ConfigJWT.create_token_type;
    let token = (0, jsonwebtoken_1.sign)(user, checkType
        ? config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY
        : config_1.ConfigJWT.JWT_REFRESH_PRIVATE_KEY, { expiresIn: type === checkType ? "15m" : "60m" });
    User_1.default.updateOne({ _id: user.id, userName: user.userName }, { token: token })
        .then(() => {
        return token;
    })
        .catch(() => {
        return (token = "");
    });
    return token !== null && token !== void 0 ? token : "";
};
Auth.sendRefreshToken = (res, user) => {
    console.log("sending refresh token...");
    const token = Auth.createToken(config_1.ConfigJWT.refresh_token_type, user);
    res.cookie(config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "refreshToken",
    });
    return token;
};
Auth.verifyToken = ({ context }, next) => {
    console.log("verifying token...");
    try {
        const authHeader = context.req.header("Authorization");
        const assetToken = authHeader && authHeader.split(" ")[1];
        if (!assetToken && assetToken !== "") {
            throw new apollo_server_express_1.AuthenticationError("No token provided");
        }
        return User_1.default.findOne({
            token: assetToken,
        })
            .then((data) => {
            if (!data) {
                throw new apollo_server_express_1.AuthenticationError("token not found");
            }
            const decodedToken = (0, jsonwebtoken_1.verify)(assetToken, config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY);
            if (!decodedToken) {
                throw new apollo_server_express_1.AuthenticationError("Invalid token");
            }
            context.user = decodedToken;
            return next();
        })
            .catch(() => {
            throw new apollo_server_express_1.AuthenticationError("token not found");
        });
    }
    catch (error) {
        throw new apollo_server_express_1.AuthenticationError("Error while verifying token", error);
    }
};
//# sourceMappingURL=auth.js.map