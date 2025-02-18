"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationMiddleware = exports.VerifyTokenForgotPassword = exports.VerifyTokenAll = exports.AuthMiddleware = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../config");
const user_model_1 = __importDefault(require("../models/user/user.model"));
const role_model_1 = __importDefault(require("../models/role/role.model"));
class AuthMiddleware {
    static getParentClass(fieldName, parentTypeName) {
        const metadata = global
            .TypeGraphQLMetadataStorage;
        switch (parentTypeName) {
            case "Query":
                const queries = metadata.queries.find((m) => m.methodName === fieldName);
                return queries === null || queries === void 0 ? void 0 : queries.target.name;
            case "Mutation":
                const mutations = metadata.mutations.find((m) => m.methodName === fieldName);
                return mutations === null || mutations === void 0 ? void 0 : mutations.target.name;
            case "Subscription":
                const subscriptions = metadata.subscriptions.find((m) => m.methodName === fieldName);
                return subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.target.name;
        }
        return undefined;
    }
    static decodeToken(token) {
        if (!token) {
            return undefined;
        }
        const decoded = (0, jsonwebtoken_1.decode)(token);
        return decoded;
    }
}
exports.AuthMiddleware = AuthMiddleware;
_a = AuthMiddleware;
AuthMiddleware.createToken = (type, user) => {
    const checkType = type === config_1.ConfigJWT.create_token_type;
    let token = (0, jsonwebtoken_1.sign)(user, checkType
        ? config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY
        : config_1.ConfigJWT.JWT_REFRESH_PRIVATE_KEY, { expiresIn: checkType ? "1d" : "7d" });
    return token !== null && token !== void 0 ? token : "";
};
AuthMiddleware.sendRefreshToken = (res, user) => {
    console.log("sending refresh token...");
    const token = _a.createToken(config_1.ConfigJWT.refresh_token_type, user);
    res.cookie(config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "refreshToken",
    });
    return token;
};
AuthMiddleware.verifyToken = (requiredRole) => async ({ context }, next) => {
    const authHeader = context.req.header("Authorization");
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token)
        throw new apollo_server_express_1.AuthenticationError("No token provided");
    const decodedToken = _a.decodeAndVerifyToken(token, requiredRole);
    const user = await _a.findUser(decodedToken);
    if (!user)
        throw new apollo_server_express_1.AuthenticationError("User not found");
    context.user = decodedToken;
    return await next();
};
AuthMiddleware.verifyTokenRest = (req, res, next) => {
    var _b;
    const authHeader = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.toString();
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "No token provided" });
    }
    try {
        const decodedToken = _a.decodeAndVerifyToken(token, config_1.Role.ALL);
        const user = _a.findUser(decodedToken);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        req.user = decodedToken;
        return next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
AuthMiddleware.accessedMethod = () => async ({ context, info }, next) => {
    var _b;
    try {
        const { fieldName } = info;
        const { req, version } = context;
        const parentTypes = ["Query", "Mutation", "Subscription"];
        const parentTypeName = info.parentType.name;
        const { publicFunctions } = require(`../../${version !== null && version !== void 0 ? version : "v1"}/resolvers`);
        if (parentTypes.includes(parentTypeName)) {
            if (publicFunctions.includes(fieldName)) {
                return next();
            }
            const parentName = _a.getParentClass(info.fieldName, parentTypeName);
            if (publicFunctions.includes(parentName)) {
                return next();
            }
            const authHeader = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.toString();
            const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
            if (!token)
                throw new Error("No token provided");
            const user = _a.decodeToken(token);
            if (!user)
                throw new Error("User not found");
            const roleId = user === null || user === void 0 ? void 0 : user.role;
            const userRole = await role_model_1.default.findById(roleId);
            if (!userRole) {
                throw new Error("Role not found");
            }
            if (userRole.permissions.includes(parentName)) {
                return next();
            }
            if (!userRole.permissions.includes(fieldName)) {
                return next();
            }
            throw new Error("You do not have permission to access this resource");
        }
        return next();
    }
    catch (error) {
        throw new Error("Authorization failed: " + error.message);
    }
};
AuthMiddleware.decodeAndVerifyToken = (token, requiredRole) => {
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, config_1.ConfigJWT.JWT_ACCESS_PRIVATE_KEY);
        if (decoded.tokenPermissions !== requiredRole) {
            throw new apollo_server_express_1.AuthenticationError("Unauthorized role");
        }
        return decoded;
    }
    catch (error) {
        throw new apollo_server_express_1.AuthenticationError("Invalid token");
    }
};
AuthMiddleware.findUser = async (decodedToken) => {
    return user_model_1.default.findOne({
        _id: decodedToken.id,
        email: decodedToken.email,
    });
};
const VerifyTokenForgotPassword = AuthMiddleware.verifyToken(config_1.Role.FORGOT_PASSWORD);
exports.VerifyTokenForgotPassword = VerifyTokenForgotPassword;
const VerifyTokenAll = AuthMiddleware.verifyToken(config_1.Role.ALL);
exports.VerifyTokenAll = VerifyTokenAll;
const AuthorizationMiddleware = AuthMiddleware.accessedMethod();
exports.AuthorizationMiddleware = AuthorizationMiddleware;
//# sourceMappingURL=auth.js.map