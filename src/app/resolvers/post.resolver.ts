import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { FriendStatus } from "../enum/friend.enum";
import { VerifyTokenAll } from "../middleware/auth";
import { FriendModel, IFriend } from "../models/friend/friend.model";
import Post from "../models/post/post.model";
import Reaction from "../models/reaction/reaction.model.ts";
import User from "../models/user/user.model";
import { Context } from "../types/Context";
import { CreatePostInput } from "../types/input/post/createPostInput";
import { GetListPostResponse } from "../types/response/post/GetAllPostResponse";
import { PostMutationResponse } from "../types/response/post/PostMutationResponse";

@Resolver()
export class PostResolver {
  @Query((_return) => GetListPostResponse)
  async allPosts(
    @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
    @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number
  ): Promise<GetListPostResponse> {
    try {
      const posts = await Post.find()
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
    } catch (error) {
      throw new Error("Could not fetch posts");
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query((_return) => GetListPostResponse)
  async postsOfFriends(
    @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
    @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number,
    @Ctx() { user }: Context
  ): Promise<GetListPostResponse> {
    try {
      const friends: IFriend[] = await FriendModel.find({
        $or: [
          { user: user.id, status: FriendStatus.ACCEPTED },
          { friend: user.id, status: FriendStatus.ACCEPTED },
        ],
      });

      const friendIds: string[] = friends.map((friend) => {
        return friend.user.toString() === user.id
          ? friend.friend.toString()
          : friend.user.toString();
      });

      const postsOfFriends = await Post.find({
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
    } catch (error) {
      throw new Error("Could not fetch posts of friends");
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => GetListPostResponse)
  async yourPosts(
    @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
    @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number,
    @Ctx() { user }: Context
  ): Promise<GetListPostResponse> {
    try {
      // Ensure the user has permission to access the posts
      if (!user.id) {
        return {
          code: 403,
          success: false,
          message: "Unauthorized access to user's posts!",
        };
      }

      const postsOfUser = await Post.find({ user: user.id })
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
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal server error",
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
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

      const reactions = await Reaction.find();

      const postReactions = reactions.map((reaction) => ({
        name: reaction.name,
        count: reaction.count,
        imageURL: reaction.imageURL,
      }));

      const newPost = new Post({
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
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal server error",
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => PostMutationResponse)
  async increaseReactionCount(
    @Arg("postId") postId: string,
    @Arg("reactName") reactName: string,
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

      const post = await Post.findById(postId);
      if (!post) {
        return {
          code: 404,
          success: false,
          message: "Post not found!",
        };
      }

      const reaction = post.reactions.find(
        (reaction) => reaction.name === reactName
      );

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
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal server error",
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => PostMutationResponse)
  async decreaseReactionCount(
    @Arg("postId") postId: string,
    @Arg("reactName") reactName: string,
    @Ctx() { user }: Context
  ): Promise<PostMutationResponse> {
    try {
      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await User.findById(user.id);
      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: "User not found!",
        };
      }

      const post = await Post.findById(postId);
      if (!post) {
        return {
          code: 404,
          success: false,
          message: "Post not found!",
        };
      }

      const reaction = post.reactions.find(
        (reaction) => reaction.name === reactName
      );

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
