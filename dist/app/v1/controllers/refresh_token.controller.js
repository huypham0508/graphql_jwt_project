"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRefreshToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../config");
const user_model_1 = __importDefault(require("../../core/models/user/user.model"));
const auth_1 = require("../../core/middleware/auth");
const handleRefreshToken = async (req, res) => {
    console.log("sending refresh token...");
    const nameCookie = config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME;
    let refreshToken = await (req === null || req === void 0 ? void 0 : req.cookies[nameCookie]);
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
        const decoded = (0, jsonwebtoken_1.verify)(refreshToken, config_1.ConfigJWT.JWT_REFRESH_PRIVATE_KEY);
        const existingUser = await user_model_1.default.findOne({
            _id: decoded.id,
        });
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        const tokenPayload = {
            id: existingUser._id,
            email: existingUser.email,
            userName: existingUser.userName,
            tokenPermissions: config_1.Role.ALL,
            role: existingUser.role,
        };
        const newRefreshToken = auth_1.AuthMiddleware.sendRefreshToken(res, tokenPayload);
        return res.status(200).json({
            success: true,
            message: "Successfully!!!",
            accessToken: auth_1.AuthMiddleware.createToken(config_1.ConfigJWT.create_token_type, tokenPayload),
            newRefreshToken,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "error" + error,
        });
    }
};
exports.handleRefreshToken = handleRefreshToken;
//# sourceMappingURL=refresh_token.controller.js.map