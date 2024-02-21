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
const Post_1 = __importDefault(require("../models/post/Post"));
const GetAllPostResponse_1 = require("../types/response/post/GetAllPostResponse");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/user/User"));
const PostMutationResponse_1 = require("../types/response/post/PostMutationResponse");
const createPostInput_1 = require("../types/input/post/createPostInput");
let PostResolver = exports.PostResolver = class PostResolver {
    async allPosts() {
        try {
            const posts = await Post_1.default.find();
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
    async createPost(postInput, { user }) {
        try {
            const existingUser = await User_1.default.findById(user.id);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "User not found!",
                };
            }
            const newPost = new Post_1.default({
                imageUrl: postInput.imageUrl,
                description: postInput.description,
                userId: user.id,
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
};
__decorate([
    (0, type_graphql_1.Query)((_return) => GetAllPostResponse_1.GetAllPostResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "allPosts", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.Auth.verifyToken),
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("postInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPostInput_1.CreatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=post.resolver.js.map