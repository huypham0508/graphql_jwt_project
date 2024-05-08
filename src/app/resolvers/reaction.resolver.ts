import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { verifyTokenAll } from "../middleware/auth";
import Post from "../models/post/post.model";
import Reaction from "../models/reaction/reaction.model.ts";
import User from "../models/user/user.model";
import { Context } from "../types/Context";
import { CreateReactionInput } from "../types/input/reaction/CreateReactionInput";
import { CreateReactionResponse } from "../types/response/reaction/CreateReactionResponse";
import { GetReactionsResponse } from "../types/response/reaction/GetReactionsResponse";

@Resolver()
export class ReactionResolver {
  @Query(() => GetReactionsResponse)
  async reactions(): Promise<GetReactionsResponse> {
    try {
      const reactions = await Reaction.find();
      return {
        code: 200,
        success: true,
        message: "successfully",
        data: reactions,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "error",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => CreateReactionResponse)
  async createReaction(
    @Arg("reactionInput") reactionInput: CreateReactionInput,
    @Ctx() { user }: Context
  ): Promise<CreateReactionResponse> {
    try {
      const existingUser = await User.findById(user.id);
      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: "User not found!",
        };
      }

      const newReaction = new Reaction({
        name: reactionInput.name,
        imageURL: reactionInput.imageURL,
      });

      await newReaction.save();

      const posts = await Post.find();
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
