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
exports.UserResolver = void 0;
const User_1 = __importDefault(require("../models/User"));
const RegisterInput_1 = require("../types/RegisterInput");
const type_graphql_1 = require("type-graphql");
const UserMutationResponse_1 = require("../types/UserMutationResponse");
const LoginInput_1 = require("../types/LoginInput");
const index_1 = require("../bcrypt/index");
const auth_1 = require("../utils/auth");
let UserResolver = exports.UserResolver = class UserResolver {
    async register(registerInput) {
        const { email, userName, password } = registerInput;
        const existingUser = await User_1.default.findOne({
            email
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
        });
        await newUser.save();
        return {
            code: 200,
            success: true,
            message: "User registered successfully!!!",
        };
    }
    async login({ email, password }) {
        let hashPassword = "";
        const checkAccount = await User_1.default.findOne({
            email
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
        return {
            code: 200,
            success: true,
            message: "Logged in successfully!!!",
            accessToken: auth_1.Auth.createToken({
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: checkAccount.password,
            }),
            user: {
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: checkAccount.password,
            },
        };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(_return => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('registerInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('loginInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=user.js.map