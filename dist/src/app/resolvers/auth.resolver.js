"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResolver = void 0;
const type_graphql_1 = require("type-graphql");
const index_1 = require("../bcrypt/index");
const config_1 = require("../config/config");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/user/User"));
const generateOTP_1 = __importDefault(require("../utils/generateOTP"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const LoginInput_1 = require("../types/input/user/LoginInput");
const RegisterInput_1 = require("../types/input/user/RegisterInput");
const UserMutationResponse_1 = require("../types/response/user/UserMutationResponse");
const ForgotPasswordResponse_1 = require("../types/response/auth/ForgotPasswordResponse");
let AuthResolver = exports.AuthResolver = class AuthResolver {
    async register(registerInput) {
        console.log("register is working...");
        const { email, userName, password } = registerInput;
        const existingUser = await User_1.default.findOne({
            email,
        });
        if (existingUser) {
            return {
                code: 400,
                success: false,
                message: "Email already exists!!!",
            };
        }
        const hashedPassword = await index_1.Bcrypt.hashPassword(password);
        const newUser = new User_1.default({
            email,
            userName,
            password: hashedPassword,
            tokenVersion: 0,
            otp: null,
            otpExpirationTime: null,
        });
        await newUser.save();
        return {
            code: 200,
            success: true,
            message: "User registered successfully!!!",
        };
    }
    async login({ email, password }, { res }) {
        console.log("login is working...");
        let hashPassword = "";
        const checkAccount = await User_1.default.findOne({
            email,
        });
        if (!checkAccount) {
            return {
                code: 400,
                success: false,
                message: "Email error!!!",
            };
        }
        hashPassword = await checkAccount.password;
        const checkPassword = await index_1.Bcrypt.comparePassword(password, hashPassword);
        if (!checkPassword) {
            return {
                code: 400,
                success: false,
                message: "Password error!!!",
            };
        }
        const refreshToken = auth_1.Auth.sendRefreshToken(res, {
            id: checkAccount._id,
            email: checkAccount.email,
            userName: checkAccount.userName,
            tokenVersion: checkAccount.tokenVersion,
            password: "",
        });
        const userModel = {
            id: checkAccount._id,
            email: checkAccount.email,
            userName: checkAccount.userName,
            password: "",
        };
        return {
            code: 200,
            success: true,
            message: "Logged in successfully!!!",
            accessToken: auth_1.Auth.createToken(config_1.ConfigJWT.create_token_type, userModel),
            refreshToken: refreshToken !== null && refreshToken !== void 0 ? refreshToken : "",
            user: {
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: "checkAccount.password",
            },
        };
    }
    async forgotPassword(email) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return {
                code: 400,
                success: false,
                message: "Email not found.",
            };
        }
        const otp = (0, generateOTP_1.default)();
        const mailOptions = {
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`,
        };
        await (0, sendEmail_1.default)(mailOptions);
        const expirationTime = Date.now() + config_1.Otp.EXPIRATION_TIME;
        await User_1.default.updateOne({ _id: user.id, email: email }, { otp: otp, otpExpirationTime: expirationTime });
        return {
            code: 200,
            success: true,
            message: "OTP sent to your email. Please check your inbox.",
        };
    }
    async submitOTP(email, otp) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return {
                code: 400,
                success: false,
                message: "Email not found.",
            };
        }
        if (user.otp !== otp) {
            return {
                code: 400,
                success: false,
                message: "Invalid OTP.",
            };
        }
        const dateNow = Date.now();
        if (dateNow > user.otpExpirationTime) {
            return {
                code: 400,
                success: false,
                message: "OTP expired",
            };
        }
        await User_1.default.updateOne({ _id: user.id, email: email }, { otp: null, otpExpirationTime: null });
        return {
            code: 200,
            success: true,
            message: "OTP submitted successfully.",
        };
    }
    async resetPassword(email, newPassword) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return {
                code: 400,
                success: false,
                message: "Email not found.",
            };
        }
        const hashedPassword = await index_1.Bcrypt.hashPassword(newPassword);
        await User_1.default.updateOne({ _id: user.id, email: email }, { password: hashedPassword });
        return {
            code: 200,
            success: true,
            message: "Password reset successfully.",
        };
    }
    async logout(id, { res }) {
        console.log("logout is working...");
        const existingUser = await User_1.default.findOne({
            _id: id,
        });
        if (!existingUser) {
            return {
                code: 401,
                success: true,
                message: "Error !!!",
            };
        }
        const versionPlus = existingUser.tokenVersion !== undefined
            ? existingUser.tokenVersion + 1
            : 0;
        existingUser.tokenVersion = versionPlus;
        existingUser.token = "";
        await existingUser.save();
        res.clearCookie(config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/refresh_token",
        });
        return {
            code: 200,
            success: true,
            message: "Logged out successfully!!!",
        };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("registerInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("loginInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => ForgotPasswordResponse_1.ForgotPasswordResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => ForgotPasswordResponse_1.ForgotPasswordResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("otp")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "submitOTP", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => ForgotPasswordResponse_1.ForgotPasswordResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("newPassword")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("id", (_type) => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logout", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map