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
import ChatConversationModel, { IConversation } from "../../core/models/chat/conversation.model";
import { Context } from "../../core/types/Context";
import { ResponseData } from "../../core/types/response/IMutationResponse";

@Resolver()
export class EmitEventResolver {
  @Mutation((_return) => ResponseData)
  @UseMiddleware(VerifyTokenAll)
  async typing(
    @Arg("conversationId") conversationId: string,
    @Ctx() context: Context
  ): Promise<ResponseData> {
    const { user, req } = context;
    try {
      if (!conversationId) {
        throw new ApolloError(req.t("conversationId is required"));
      }
      const conversation: IConversation | null = await ChatConversationModel.findById(conversationId).lean();

      if (!conversation) {
        throw new ApolloError(req.t("Conversation not found"));
      }

      doEvents({
        eventData: {
          type: "typing",
          op: "add",
          event: {
            userTyping: user.id,
            conversationId: conversationId,
          },
          recipients: conversation.participants
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
