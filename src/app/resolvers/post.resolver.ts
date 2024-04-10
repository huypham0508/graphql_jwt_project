import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { verifyTokenAll } from "../middleware/auth";
import Post from "../models/post/Post";
import User from "../models/user/User";
import { Context } from "../types/Context";
import { CreatePostInput } from "../types/input/post/createPostInput";
import { GetAllPostResponse } from "../types/response/post/GetAllPostResponse";
import { PostMutationResponse } from "../types/response/post/PostMutationResponse";

@Resolver()
export class PostResolver {
  @Query((_return) => GetAllPostResponse)
  async allPosts(): Promise<GetAllPostResponse> {
    try {
      const posts = await Post.find();
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
    } catch (error) {
      throw new Error("Could not fetch posts");
    }
  }
  @UseMiddleware(verifyTokenAll)
  @Mutation(() => PostMutationResponse)
  async createPost(
    @Arg("postInput") postInput: CreatePostInput,
    @Ctx() { user }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingUser = await User.findById(user.id);
      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: "User not found!",
        };
      }

      const newPost = new Post({
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
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal server error",
      };
    }
  }
}
