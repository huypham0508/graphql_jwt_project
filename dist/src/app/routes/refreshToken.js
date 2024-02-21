"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../config/config");
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = __importDefault(require("../models/user/User"));
const auth_1 = require("../middleware/auth");
const refreshToken = express_1.default.Router();
refreshToken.get("/", async (req, res) => {
    console.log("sending refresh token...");
    const nameCookie = config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME;
    const refreshToken = await req.cookies[nameCookie];
    console.log({ refreshToken });
    if (!refreshToken) {
        return res.status(403).json({
            success: false,
            message: "No refresh token found",
        });
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(refreshToken, config_1.ConfigJWT.JWT_REFRESH_PRIVATE_KEY);
        const existingUser = await User_1.default.findOne({
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
        auth_1.Auth.sendRefreshToken(res, {
            id: existingUser._id,
            email: existingUser.email,
            userName: existingUser.userName,
            password: "",
        });
        return res.status(200).json({
            success: true,
            message: "Successfully!!!",
            accessToken: auth_1.Auth.createToken(config_1.ConfigJWT.create_token_type, {
                id: existingUser._id,
                email: existingUser.email,
                userName: existingUser.userName,
                password: "",
            }),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "error" + error,
        });
    }
});
exports.default = refreshToken;
//# sourceMappingURL=refreshToken.js.map