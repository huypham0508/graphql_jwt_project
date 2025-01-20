// import mongoose from "mongoose";
import { ApolloError } from "apollo-server-core";
import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { doEvents } from "../controllers/events.controller";
import { VerifyTokenAll } from "../../core/middleware/auth";
import ChatRoomModel, { IRoom } from "../../core/models/chat/room.model";
import { Context } from "../../core/types/Context";
import { ResponseData } from "../../core/types/response/IMutationResponse";

@Resolver()
export class EmitEventResolver {
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
            userTyping: user.id,
            roomId: roomId,
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
