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
import UserModel, { IUser } from "../models/user/user.model";
import { Context } from "../types/Context";
import {
  FindFriendsResponse,
  FindUserResponse,
} from "../types/response/relationship/FindFriendsResponse";
import { GetFriendsResponse } from "../types/response/relationship/GetFriendResponse";
import { RelationshipResponse } from "../types/response/relationship/RelationshipResponse";

@Resolver()
export class RelationshipResolver {
  @UseMiddleware(VerifyTokenAll)
  @Query(() => FindFriendsResponse)
  async findFriendByEmail(
    @Arg("email") email: string,
    @Ctx() { user }: Context
  ): Promise<FindFriendsResponse> {
    try {
      const friendsRequests: IUser[] = await UserModel.find({
        email: { $regex: email, $options: "i" },
      })
        .select("-password")
        .lean();

      const areFriendPromises = await Promise.all(
        friendsRequests.map(async (friendUser: any) => {
          const areFriend = await FriendModel.findOne({
            $or: [
              { user: user.id, friend: friendUser._id },
              { user: friendUser._id, friend: user.id },
            ],
          });
          const status = areFriend ? areFriend.status : "nothing";
          return status;
        })
      );

      const statuses = await Promise.all(areFriendPromises);

      const friendsWithStatus: FindUserResponse[] = friendsRequests.map(
        (friendUser: any, index) => {
          const userResponse: FindUserResponse = new FindUserResponse();
          userResponse.id = friendUser._id ?? "";
          userResponse.email = friendUser.email;
          userResponse.userName = friendUser.userName;
          userResponse.avatar = friendUser.avatar;
          userResponse.status = statuses[index].toString();
          return userResponse;
        }
      );

      if (friendsRequests) {
        return {
          code: 200,
          success: true,
          message: "get friend request successfully",
          data: friendsWithStatus,
        };
      }

      return {
        code: 404,
        success: false,
        message: "not found",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "Error",
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => GetFriendsResponse)
  async getFriendRequests(
    @Ctx() { user }: Context
  ): Promise<GetFriendsResponse> {
    try {
      const friendsRequests: IFriend[] = await FriendModel.find({
        friend: user.id,
        status: FriendStatus.PENDING,
      })
        .populate({
          path: "user",
          select: "-password",
          options: { lean: true },
        })
        .populate({
          path: "friend",
          select: "-password",
          options: { lean: true },
        });

      const formatFriends = friendsRequests
        .map((relationship) => {
          const idRelationShip = relationship.id;

          if (relationship.user.id === user.id) {
            return { ...relationship.friend, id: idRelationShip };
          } else {
            return { ...relationship.user, id: idRelationShip };
          }
        })
        .reverse();

      return {
        code: 200,
        success: true,
        message: "get friend request successfully",
        data: formatFriends,
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

  @UseMiddleware(VerifyTokenAll)
  @Query(() => GetFriendsResponse)
  async getFriendList(@Ctx() { user }: Context): Promise<GetFriendsResponse> {
    try {
      const friendList = await FriendModel.find({
        $or: [
          { user: user.id, status: FriendStatus.ACCEPTED },
          { friend: user.id, status: FriendStatus.ACCEPTED },
        ],
      })
        .populate("user")
        .populate("friend");

      const formatFriend = friendList
        .map((relationship) => {
          if (relationship.user.id === user.id) {
            return relationship.friend;
          } else {
            return relationship.user;
          }
        })
        .reverse();

      return {
        code: 200,
        success: true,
        message: "Get friend list successfully",
        data: formatFriend,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 400,
        success: false,
        message: "Could not fetch friend list",
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
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

  @UseMiddleware(VerifyTokenAll)
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

  @UseMiddleware(VerifyTokenAll)
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

      // friendRequest.status = FriendStatus.REJECTED;
      await friendRequest.deleteOne();

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

  // @UseMiddleware(VerifyTokenAll)
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
