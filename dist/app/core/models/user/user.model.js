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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.IUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const type_graphql_1 = require("type-graphql");
const role_model_1 = require("../role/role.model");
const model_name_1 = __importDefault(require("../../constants/model_name"));
const Schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
let IUser = exports.IUser = class IUser {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", Object)
], IUser.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => role_model_1.IRole),
    __metadata("design:type", role_model_1.IRole)
], IUser.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IUser.prototype, "userName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IUser.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], IUser.prototype, "isActive", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], IUser.prototype, "avatar", void 0);
exports.IUser = IUser = __decorate([
    (0, type_graphql_1.ObjectType)()
], IUser);
exports.UserSchema = new Schema({
    role: {
        type: Schema.Types.ObjectId,
        ref: "roles",
        required: true,
    },
    email: {
        type: String,
        require: true,
    },
    userName: {
        type: String,
        require: true,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        require: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    },
    token: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpExpirationTime: {
        type: Number,
    },
}, { timestamps: true });
const UserModel = model(model_name_1.default.USER, exports.UserSchema);
exports.default = UserModel;
//# sourceMappingURL=user.model.js.map