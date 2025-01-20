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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const friend_enum_1 = require("../../core/enum/friend.enum");
const auth_1 = require("../../core/middleware/auth");
const friend_model_1 = require("../../core/models/friend/friend.model");
const post_model_1 = __importDefault(require("../../core/models/post/post.model"));
const reaction_model_ts_1 = __importDefault(require("../../core/models/reaction/reaction.model.ts"));
const user_model_1 = __importDefault(require("../../core/models/user/user.model"));
const createPostInput_1 = require("../../core/types/input/post/createPostInput");
const GetAllPostResponse_1 = require("../../core/types/response/post/GetAllPostResponse");
const PostMutationResponse_1 = require("../../core/types/response/post/PostMutationResponse");
let PostResolver = exports.PostResolver = class PostResolver {
    async allPosts(pageSize, pageNumber) {
        try {
            const posts = await post_model_1.default.find()
                .populate("user")
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            if (posts.length == 0) {
                return {
                    code: 200,
                    success: true,
                    message: "post is empty",
                    data: posts,
                };
            }
            return {
                code: 200,
                success: true,
                message: "get all posts",
                data: posts,
            };
        }
        catch (error) {
            throw new Error("Could not fetch posts");
        }
    }
    async postsOfFriends(pageSize, pageNumber, { user }) {
        try {
            const friends = await friend_model_1.FriendModel.find({
                $or: [
                    { user: user.id, status: friend_enum_1.FriendStatus.ACCEPTED },
                    { friend: user.id, status: friend_enum_1.FriendStatus.ACCEPTED },
                ],
            });
            const friendIds = friends.map((friend) => {
                return friend.user.toString() === user.id
                    ? friend.friend.toString()
                    : friend.user.toString();
            });
            const postsOfFriends = await post_model_1.default.find({
                user: { $in: friendIds },
            })
                .populate("user")
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            if (postsOfFriends.length == 0) {
                return {
                    code: 200,
                    success: true,
                    message: "postsOfFriends is empty",
                    data: postsOfFriends,
                };
            }
            return {
                code: 200,
                success: true,
                message: "get all postsOfFriends",
                data: postsOfFriends,
            };
        }
        catch (error) {
            throw new Error("Could not fetch posts of friends");
        }
    }
    async yourPosts(pageSize, pageNumber, { user }) {
        try {
            if (!user.id) {
                return {
                    code: 403,
                    success: false,
                    message: "Unauthorized access to user's posts!",
                };
            }
            const postsOfUser = await post_model_1.default.find({ user: user.id })
                .populate("user")
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            if (postsOfUser.length === 0) {
                return {
                    code: 200,
                    success: true,
                    message: "User has no posts",
                    data: postsOfUser,
                };
            }
            return {
                code: 200,
                success: true,
                message: "Get all posts of user",
                data: postsOfUser,
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
    async createPost(postInput, { user }) {
        try {
            const existingUser = await user_model_1.default.findById(user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "User not found!",
                };
            }
            const reactions = await reaction_model_ts_1.default.find();
            const postReactions = reactions.map((reaction) => ({
                name: reaction.name,
                count: reaction.count,
                imageURL: reaction.imageURL,
            }));
            const newPost = new post_model_1.default({
                imageUrl: postInput.imageUrl,
                description: postInput.description,
                user: user.id,
                reactions: postReactions,
            });
            await newPost.save();
            return {
                code: 200,
                success: true,
                message: "Post created successfully!",
                data: newPost,
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
    async increaseReactionCount(postId, reactName, { user }) {
        try {
            const existingUser = await user_model_1.default.findById(user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "User not found!",
                };
            }
            const post = await post_model_1.default.findById(postId);
            if (!post) {
                return {
                    code: 404,
                    success: false,
                    message: "Post not found!",
                };
            }
            const reaction = post.reactions.find((reaction) => reaction.name === reactName);
            if (!reaction) {
                return {
                    code: 404,
                    success: false,
                    message: "Reaction not found in this post!",
                };
            }
            reaction.count++;
            await post.save();
            return {
                code: 200,
                success: true,
                message: "Reaction count increased successfully!",
                data: post,
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
    async decreaseReactionCount(postId, reactName, { user }) {
        try {
            const existingUser = await user_model_1.default.findById(user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "User not found!",
                };
            }
            const post = await post_model_1.default.findById(postId);
            if (!post) {
                return {
                    code: 404,
                    success: false,
                    message: "Post not found!",
                };
            }
            const reaction = post.reactions.find((reaction) => reaction.name === reactName);
            if (!reaction) {
                return {
                    code: 404,
                    success: false,
                    message: "Reaction not found in this post!",
                };
            }
            if (reaction.count > 0) {
                reaction.count--;
            }
            await post.save();
            return {
                code: 200,
                success: true,
                message: "Reaction count decreased successfully!",
                data: post,
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
    (0, type_graphql_1.Query)((_return) => GetAllPostResponse_1.GetListPostResponse),
    __param(0, (0, type_graphql_1.Arg)("pageSize", { defaultValue: 10 })),
    __param(1, (0, type_graphql_1.Arg)("pageNumber", { defaultValue: 1 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "allPosts", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)((_return) => GetAllPostResponse_1.GetListPostResponse),
    __param(0, (0, type_graphql_1.Arg)("pageSize", { defaultValue: 10 })),
    __param(1, (0, type_graphql_1.Arg)("pageNumber", { defaultValue: 1 })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "postsOfFriends", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => GetAllPostResponse_1.GetListPostResponse),
    __param(0, (0, type_graphql_1.Arg)("pageSize", { defaultValue: 10 })),
    __param(1, (0, type_graphql_1.Arg)("pageNumber", { defaultValue: 1 })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "yourPosts", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("postInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPostInput_1.CreatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("postId")),
    __param(1, (0, type_graphql_1.Arg)("reactName")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "increaseReactionCount", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("postId")),
    __param(1, (0, type_graphql_1.Arg)("reactName")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "decreaseReactionCount", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=post.resolver.js.map