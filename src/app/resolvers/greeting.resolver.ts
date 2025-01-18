// import mongoose from "mongoose";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { VerifyTokenAll } from "../middleware/auth";
import { ChatRoomModel, IRoom } from "../models/chat/room.model";
import User from "../models/user/user.model";
import { Context } from "../types/Context";
import { ResponseData } from "../types/response/IMutationResponse";
import { ApolloError } from "apollo-server-core";
import { doEvents } from "../controllers/events.controller";

@Resolver()
export class EmitEventResolver {
  @Query((_return) => String)
  @UseMiddleware(VerifyTokenAll)
  async hello(@Ctx() context: Context): Promise<String> {
    const id = context.user.id;
    const data = await User.findOne({
      _id: id,
    });

    if (!data) {
      return `data not found`;
    }
    return `hello ${data.userName ?? "world"}`;
  }

  @Mutation((_return) => ResponseData)
  @UseMiddleware(VerifyTokenAll)
  async typing(
    @Arg("roomId") roomId: string,
    @Ctx() context: Context
  ): Promise<ResponseData> {
    const { user, req } = context;
    try {
      if (!roomId) {
        throw new ApolloError(req.t("roomId is required"));
      }
      const room: IRoom | null = await ChatRoomModel.findById(roomId).lean();

      if (!room) {
        throw new ApolloError(req.t("Room not found"));
      }

      doEvents({
        eventData: {
          type: "typing",
          op: "add",
          event: {
            userId: user.id,
            room: room,
          },
          recipients: room.participants
          .filter((p) => p.toString() !== user.id)
          .map((p) => p.toString()),
        },
      });

      return {
        code: 200,
        success: true,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: error.message,
      };
    }
  }
}
