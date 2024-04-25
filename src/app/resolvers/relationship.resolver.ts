import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { FriendStatus } from "../enum/friend.enum";
import { verifyTokenAll } from "../middleware/auth";
import { FriendModel, IFriend } from "../models/friend/friend.model";
import UserModel from "../models/user/user.model";
import { Context } from "../types/Context";
import { RelationshipResponse } from "../types/response/relationship/RelationshipResponse";
import { GetFriendRequestResponse } from "../types/response/relationship/GetFriendRequestResponse";

@Resolver()
export class RelationshipResolver {
  @UseMiddleware(verifyTokenAll)
  @Query(() => GetFriendRequestResponse)
  async getFriendRequests(
    @Ctx() { user }: Context
  ): Promise<GetFriendRequestResponse> {
    try {
      const friendRequests: IFriend[] = await FriendModel.find({
        friend: user.id,
        status: FriendStatus.PENDING,
      })
        .populate("user")
        .populate("friend");

      return {
        code: 200,
        success: true,
        message: "get friend request successfully",
        data: friendRequests,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "Could not fetch friend requests",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => RelationshipResponse)
  async sendFriendRequest(
    @Arg("friendId") friendId: string,
    @Ctx() { user }: Context
  ): Promise<RelationshipResponse> {
    try {
      const friendExists = await UserModel.exists({ _id: friendId });
      if (!friendExists) {
        return {
          code: 404,
          success: false,
          message: "Friend not found",
        };
      }

      const existingRequest = await FriendModel.findOne({
        user: user.id,
        friend: friendId,
      });

      if (existingRequest) {
        return {
          code: 200,
          success: true,
          message: "Friend request already sent",
        };
      }

      const friendRequest = new FriendModel({
        user: user.id,
        friend: friendId,
        status: FriendStatus.PENDING,
      });
      await friendRequest.save();

      return {
        success: true,
        code: 200,
        message: "send request successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "send request failed",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => RelationshipResponse)
  async acceptFriendRequest(
    @Arg("requestId") requestId: string,
    @Ctx() { user }: Context
  ): Promise<RelationshipResponse> {
    try {
      const friendRequest = await FriendModel.findById(requestId);
      if (!friendRequest) {
        return {
          code: 404,
          success: false,
          message: "Friend request not found",
        };
      }

      if (friendRequest.friend.toString() !== user.id) {
        return {
          code: 200,
          success: false,
          message: "Unauthorized to accept friend request",
        };
      }

      if (friendRequest.status === FriendStatus.ACCEPTED) {
        return {
          code: 200,
          success: true,
          message: "Friend request already accepted",
        };
      }

      friendRequest.status = FriendStatus.ACCEPTED;
      await friendRequest.save();

      return {
        code: 200,
        success: true,
        message: "Accepted friend request successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "Accepted friend request failed!",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => RelationshipResponse)
  async rejectedFriendRequest(
    @Arg("requestId") requestId: string,
    @Ctx() { user }: Context
  ): Promise<RelationshipResponse> {
    try {
      const friendRequest = await FriendModel.findById(requestId);
      if (!friendRequest) {
        return {
          code: 404,
          success: false,
          message: "Friend request not found",
        };
      }

      if (friendRequest.friend.toString() !== user.id) {
        return {
          code: 200,
          success: false,
          message: "Unauthorized to accept friend request",
        };
      }

      if (friendRequest.status === FriendStatus.REJECTED) {
        return {
          code: 200,
          success: true,
          message: "Friend request already REJECTED",
        };
      }

      friendRequest.status = FriendStatus.REJECTED;
      await friendRequest.save();

      return {
        code: 200,
        success: true,
        message: "rejected friend request successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "rejected friend request error",
      };
    }
  }

  // @UseMiddleware(verifyTokenAll)
  // @Mutation(() => RelationshipResponse)
  // async areFriends(
  //   @Arg("userId") userId: string,
  //   @Arg("friendId") friendId: string
  // ): Promise<RelationshipResponse> {
  //   try {
  //     const areFriends = await FriendModel.exists({
  //       user: userId,
  //       friend: friendId,
  //       status: FriendStatus.ACCEPTED,
  //     });
  //     return areFriends ? true : false;
  //   } catch (error) {
  //     console.error(error);
  //     return false;
  //   }
  // }
}
