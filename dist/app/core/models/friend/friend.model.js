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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendModel = exports.IFriend = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const type_graphql_1 = require("type-graphql");
const user_model_1 = require("../user/user.model");
const friend_enum_1 = require("../../../core/enum/friend.enum");
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
(0, type_graphql_1.registerEnumType)(friend_enum_1.FriendStatus, {
    name: "FriendStatus",
    description: "The status of the friendship",
});
let IFriend = exports.IFriend = class IFriend {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", String)
], IFriend.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => user_model_1.IUser),
    __metadata("design:type", user_model_1.IUser)
], IFriend.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => user_model_1.IUser),
    __metadata("design:type", user_model_1.IUser)
], IFriend.prototype, "friend", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => friend_enum_1.FriendStatus),
    __metadata("design:type", String)
], IFriend.prototype, "status", void 0);
exports.IFriend = IFriend = __decorate([
    (0, type_graphql_1.ObjectType)()
], IFriend);
const FriendSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: model_name_1.default.USER, required: true },
    friend: { type: mongoose_1.Schema.Types.ObjectId, ref: model_name_1.default.USER, required: true },
    status: {
        type: String,
        enum: Object.values(friend_enum_1.FriendStatus),
        default: friend_enum_1.FriendStatus.PENDING,
    },
});
exports.FriendModel = mongoose_1.default.model(model_name_1.default.FRIEND, FriendSchema);
//# sourceMappingURL=friend.model.js.map