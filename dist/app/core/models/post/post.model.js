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
exports.PostSchema = exports.IPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const type_graphql_1 = require("type-graphql");
const user_model_1 = require("../user/user.model");
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
const reaction_model_ts_1 = require("../reaction/reaction.model.ts");
const Schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
let IPost = exports.IPost = class IPost {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", Object)
], IPost.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => user_model_1.IUser),
    __metadata("design:type", user_model_1.IUser)
], IPost.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => [reaction_model_ts_1.IReaction]),
    __metadata("design:type", Array)
], IPost.prototype, "reactions", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], IPost.prototype, "imageUrl", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], IPost.prototype, "description", void 0);
exports.IPost = IPost = __decorate([
    (0, type_graphql_1.ObjectType)()
], IPost);
exports.PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: model_name_1.default.USER, required: true },
    imageUrl: {
        type: String,
    },
    description: {
        type: String,
    },
    reactions: [{ type: Schema.Types.ObjectId, ref: model_name_1.default.REACTION, require: true }],
}, { timestamps: true });
const PostModel = model(model_name_1.default.POST, exports.PostSchema);
exports.default = PostModel;
//# sourceMappingURL=post.model.js.map