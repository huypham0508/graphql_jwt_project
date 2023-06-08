"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config/config");
const apollo_server_express_1 = require("apollo-server-express");
class Auth {
}
exports.Auth = Auth;
Auth.createToken = (user) => {
    return (0, jsonwebtoken_1.sign)({
        id: user.id,
        username: user.userName
    }, config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY, {
        expiresIn: "15m"
    });
};
Auth.verifyToken = ({ context }, next) => {
    try {
        const authHeader = context.req.header('Authorization');
        const assetToken = authHeader && authHeader.split(" ")[1];
        if (!assetToken) {
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