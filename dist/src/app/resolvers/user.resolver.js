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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = __importStar(require("../models/user/User"));
const RegisterInput_1 = require("../types/input/user/RegisterInput");
const type_graphql_1 = require("type-graphql");
const UserMutationResponse_1 = require("../types/response/user/UserMutationResponse");
const LoginInput_1 = require("../types/input/user/LoginInput");
const index_1 = require("../bcrypt/index");
const auth_1 = require("../middleware/auth");
const config_1 = require("../config/config");
let UserResolver = exports.UserResolver = class UserResolver {
    async getUser() {
        const data = await User_1.default.find();
        return data;
    }
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
        });
        await newUser.save();
        return {
            code: 200,
            success: true,
            message: "User registered successfully!!!",
        };
    }
    async login({ email, password }, { res }) {
        var _a;
        console.log("login is working...");
        let hashPassword = "";
        const checkAccount = await User_1.default.findOne({
            email,
        });
        if (!checkAccount) {
            return {
                code: 400,
                success: false,
                message: "Emaill error!!!",
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
        auth_1.Auth.sendRefreshToken(res, {
            id: checkAccount._id,
            email: checkAccount.email,
            userName: checkAccount.userName,
            tokenVersion: checkAccount.tokenVersion,
            password: "checkAccount.password",
        });
        const userModel = {
            id: checkAccount._id,
            email: checkAccount.email,
            userName: checkAccount.userName,
            password: "checkAccount.password",
        };
        return {
            code: 200,
            success: true,
            message: "Logged in successfully!!!",
            accessToken: (_a = auth_1.Auth.createToken(config_1.ConfigJWT.create_token_type, userModel)) !== null && _a !== void 0 ? _a : "",
            user: {
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: "checkAccount.password",
            },
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
        existingUser.tokenVersion = await versionPlus;
        existingUser.token = await "";
        await existingUser.save();
        await res.clearCookie(config_1.ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, {
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
    (0, type_graphql_1.Query)((_return) => [User_1.IUser]),
    (0, type_graphql_1.UseMiddleware)(auth_1.Auth.verifyToken),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUser", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("registerInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("loginInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("id", (_type) => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=user.resolver.js.map