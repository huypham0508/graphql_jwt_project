"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config/config");
const apollo_server_express_1 = require("apollo-server-express");
class Auth {
}
exports.Auth = Auth;
Auth.createToken = (type, user) => {
    const checkType = type === config_1.ConfigJWT.create_token_type;
    return (0, jsonwebtoken_1.sign)({
        id: user.id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
    }, checkType ? config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY : config_1.ConfigJWT.JWT_REFRESH_PRIVATE_KEY, { expiresIn: type === checkType ? "15m" : "60m" });
};
Auth.sendRefreshToken = (res, user) => {
    res.cookie(config_1.ConfigJWT.REFRESH_TOKEN_COOKI_NAME, Auth.createToken(config_1.ConfigJWT.refresh_token_type, user), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/refresh_token',
    });
};
Auth.verifyToken = ({ context }, next) => {
    try {
        const authHeader = context.req.header('Authorization');
        const assetToken = authHeader && authHeader.split(" ")[1];
        if (!assetToken && assetToken !== "") {
            throw new apollo_server_express_1.AuthenticationError("No token provided");
        }
        const decodedToken = (0, jsonwebtoken_1.verify)(assetToken, config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY);
        if (!decodedToken) {
            throw new apollo_server_express_1.AuthenticationError("Invalid token");
        }
        context.user = decodedToken;
        return next();
    }
    catch (error) {
        throw new apollo_server_express_1.AuthenticationError("Error while verifying token", error);
    }
};
//# sourceMappingURL=auth.js.map