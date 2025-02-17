"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const apollo_server_core_1 = require("apollo-server-core");
const type_graphql_1 = require("type-graphql");
const index_1 = require("../../core/bcrypt/index");
const config_1 = require("../../config");
const auth_1 = require("../../core/middleware/auth");
const user_model_1 = __importStar(require("../../core/models/user/user.model"));
const generate_otp_1 = __importDefault(require("../../core/utils/generate_otp"));
const role_model_1 = __importDefault(require("../../core/models/role/role.model"));
const LoginInput_1 = require("../../core/types/input/user/LoginInput");
const RegisterInput_1 = require("../../core/types/input/user/RegisterInput");
const UpdateUserInput_1 = require("../../core/types/input/user/UpdateUserInput");
const ForgotPasswordResponse_1 = require("../../core/types/response/auth/ForgotPasswordResponse");
const UserMutationResponse_1 = require("../../core/types/response/user/UserMutationResponse");
const send_email_1 = __importDefault(require("../../core/utils/send_email"));
let AuthResolver = exports.AuthResolver = class AuthResolver {
    async hello(context) {
        var _a;
        const id = context.user.id;
        const data = await user_model_1.default.findOne({
            _id: id,
        });
        if (!data) {
            return `data not found`;
        }
        return `hello ${(_a = data.userName) !== null && _a !== void 0 ? _a : "world"}`;
    }
    async getUsers(_) {
        const data = await user_model_1.default.find();
        return data;
    }
    async register(registerInput, { req }) {
        const { email, userName, password, avatar } = registerInput;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return {
                code: 400,
                success: false,
                message: req.t("Email already exists!"),
            };
        }
        const defaultRole = await role_model_1.default.findOne({ name: "member" });
        const hashedPassword = await index_1.Bcrypt.hashPassword(password);
        const newUser = new user_model_1.default({
            email,
            userName,
            password: hashedPassword,
            avatar: avatar,
            otp: undefined,
            otpExpirationTime: undefined,
            role: defaultRole,
        });
        await newUser.save();
        return {
            code: 200,
            success: true,
            message: req.t("User registered successfully!"),
            user: newUser,
        };
    }
    async login({ email, password }, { req, res }) {
        var _a;
        console.log("login is working...", email);
        const checkAccount = await user_model_1.default.findOne({
            email,
        });
        if (!checkAccount) {
            return {
                code: 400,
                success: false,
                message: req.t("Email not found!"),
            };
        }
        let hashPassword = (_a = checkAccount === null || checkAccount === void 0 ? void 0 : checkAccount.password) !== null && _a !== void 0 ? _a : "";
        const checkPassword = await index_1.Bcrypt.comparePassword(password, hashPassword);
        if (!checkPassword) {
            return {
                code: 400,
                success: false,
                message: req.t("Password error!"),
            };
        }
        const userModel = {
            id: checkAccount.id,
            email: checkAccount.email,
            userName: checkAccount.userName,
            tokenPermissions: config_1.Role.ALL,
            role: checkAccount.role,
        };
        const refreshToken = auth_1.AuthMiddleware.sendRefreshToken(res, userModel);
        return {
            code: 200,
            success: true,
            message: req.t("Logged in successfully!"),
            accessToken: auth_1.AuthMiddleware.createToken(config_1.ConfigJWT.create_token_type, userModel),
            refreshToken: refreshToken !== null && refreshToken !== void 0 ? refreshToken : "",
            user: {
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: "",
                avatar: checkAccount.avatar,
                role: checkAccount.role
            },
        };
    }
    async forgotPassword(email, { req }) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return {
                code: 400,
                success: false,
                message: req.t("Email not found!"),
            };
        }
        const otp = (0, generate_otp_1.default)();
        const mailOptions = {
            to: email,
            subject: req.t("Password Reset OTP"),
            text: req.t("Your OTP for password reset is: {{otp}}", { otp: otp }),
        };
        (0, send_email_1.default)(mailOptions);
        const expirationTime = Date.now() + config_1.Otp.EXPIRATION_TIME;
        await user_model_1.default.updateOne({ _id: user.id, email: email }, { otp: otp, otpExpirationTime: expirationTime });
        return {
            code: 200,
            success: true,
            message: req.t("OTP sent to your email. Please check your inbox."),
        };
    }
    async submitOTP(email, otp, { req }) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return {
                code: 400,
                success: false,
                message: req.t("Email not found!"),
            };
        }
        if (user.otp !== otp) {
            return {
                code: 400,
                success: false,
                message: req.t("OTP not match"),
            };
        }
        const dateNow = Date.now();
        if (dateNow > user.otpExpirationTime) {
            return {
                code: 400,
                success: false,
                message: req.t("OTP expired"),
            };
        }
        await user_model_1.default.updateOne({ _id: user.id, email: email }, { otp: null, otpExpirationTime: null });
        const tokenPayLoad = {
            id: user._id,
            email: user.email,
            userName: user.userName,
            tokenPermissions: config_1.Role.FORGOT_PASSWORD,
            role: user.role
        };
        const token = auth_1.AuthMiddleware.createToken(config_1.ConfigJWT.create_token_type, tokenPayLoad);
        return {
            code: 200,
            success: true,
            accessToken: token,
            message: req.t("OTP submitted successfully."),
        };
    }
    async resetPassword(newPassword, { req, user: payloadVerify }) {
        const user = await user_model_1.default.findOne({ email: payloadVerify.email });
        if (!user) {
            throw new apollo_server_core_1.ApolloError(req.t("User not found!"));
        }
        try {
            const hashedPassword = await index_1.Bcrypt.hashPassword(newPassword);
            await user_model_1.default.updateOne({ _id: user.id, email: payloadVerify.email }, {
                password: hashedPassword,
            });
            return {
                code: 200,
                success: true,
                message: req.t("Password reset successfully."),
            };
        }
        catch (error) {
            console.error("Error resetting password:", error);
            throw new apollo_server_core_1.ApolloError("Failed to reset password.", "RESET_PASSWORD_FAILED");
        }
    }
    async logout(id, { req, res }) {
        const existingUser = await user_model_1.default.findOne({
            _id: id,
        });
        if (!existingUser) {
            return {
                code: 401,
                success: true,
                message: req.t("User not found!"),
            };
        }
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
            message: req.t("Logged out successfully!"),
        };
    }
    async updateUser(updateUserInput, context) {
        try {
            const { username, avatar } = updateUserInput;
            const existingUser = await user_model_1.default.findById(context.user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: context.req.t("User not found!"),
                };
            }
            if (username) {
                existingUser.userName = username;
            }
            if (avatar) {
                existingUser.avatar = avatar;
            }
            await existingUser.save();
            return {
                code: 200,
                success: true,
                message: context.req.t("User updated successfully"),
                user: existingUser,
            };
        }
        catch (error) {
            return {
                code: 400,
                success: false,
                message: error.message,
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.Query)((_return) => String),
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => [user_model_1.IUser]),
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "getUsers", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("registerInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput, Object]),
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
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => ForgotPasswordResponse_1.ForgotPasswordResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("otp")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "submitOTP", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenForgotPassword),
    (0, type_graphql_1.Mutation)((_return) => ForgotPasswordResponse_1.ForgotPasswordResponse),
    __param(0, (0, type_graphql_1.Arg)("newPassword")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("updateUserInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateUserInput_1.UpdateUserInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "updateUser", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map