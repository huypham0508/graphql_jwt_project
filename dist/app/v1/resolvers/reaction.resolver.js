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
exports.ReactionResolver = void 0;
const type_graphql_1 = require("type-graphql");
const auth_1 = require("../../core/middleware/auth");
const post_model_1 = __importDefault(require("../../core/models/post/post.model"));
const reaction_model_ts_1 = __importDefault(require("../../core/models/reaction/reaction.model.ts"));
const user_model_1 = __importDefault(require("../../core/models/user/user.model"));
const CreateReactionInput_1 = require("../../core/types/input/reaction/CreateReactionInput");
const CreateReactionResponse_1 = require("../../core/types/response/reaction/CreateReactionResponse");
const GetReactionsResponse_1 = require("../../core/types/response/reaction/GetReactionsResponse");
let ReactionResolver = exports.ReactionResolver = class ReactionResolver {
    async reactions() {
        try {
            const reactions = await reaction_model_ts_1.default.find();
            return {
                code: 200,
                success: true,
                message: "successfully",
                data: reactions,
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "error",
            };
        }
    }
    async createReaction(reactionInput, { user }) {
        try {
            const existingUser = await user_model_1.default.findById(user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "User not found!",
                };
            }
            const newReaction = new reaction_model_ts_1.default({
                name: reactionInput.name,
                imageURL: reactionInput.imageURL,
            });
            await newReaction.save();
            const posts = await post_model_1.default.find();
            for (const post of posts) {
                post.reactions.push(newReaction);
                await post.save();
            }
            return {
                code: 200,
                success: true,
                message: "Reaction created successfully!",
                data: newReaction,
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 500,
                success: false,
                message: "Internal server error",
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => GetReactionsResponse_1.GetReactionsResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReactionResolver.prototype, "reactions", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => CreateReactionResponse_1.CreateReactionResponse),
    __param(0, (0, type_graphql_1.Arg)("reactionInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateReactionInput_1.CreateReactionInput, Object]),
    __metadata("design:returntype", Promise)
], ReactionResolver.prototype, "createReaction", null);
exports.ReactionResolver = ReactionResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], ReactionResolver);
//# sourceMappingURL=reaction.resolver.js.map