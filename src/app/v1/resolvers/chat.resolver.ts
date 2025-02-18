import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { VerifyTokenAll } from "../../core/middleware/auth";
import ConversationModel from "../../core/models/chat/conversation.model";
import { MessageModel } from "../../core/models/chat/message.model";
import SubscriptionModel from "../../core/models/chat/subscription.model";
import { Context } from "../../core/types/Context";
import { SendMessageInput } from "../../core/types/input/chat/MessageInput";
import { GetConversationsResponse } from "../../core/types/response/chat/GetConversationsResponse";
import {
  MessageData,
  MessageResponse,
} from "../../core/types/response/chat/MessageResponse";
import { SendNewMessageResponse } from "../../core/types/response/chat/SendNewMessageResponse";
import { ResponseData } from "../../core/types/response/IMutationResponse";
import {
  getConversationOrCreate,
  populateConversation,
  updateLastMessage,
} from "../actions/chat/conversation.actions";
import { addMessage } from "../actions/chat/message.actions";
import { createSubscriptions } from "../actions/chat/subscription.actions";
import { doEvents } from "../controllers/events.controller";

@Resolver()
export class ChatResolver {
  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => SendNewMessageResponse)
  async sendMessage(
    @Arg("sendMessageInput") messageInput: SendMessageInput,
    @Ctx() { req, user }: Context
  ): Promise<SendNewMessageResponse> {
    try {
      const { content, recipientId, conversationId } = messageInput;

      let conversation;
      let recipients: string[];

      if (recipientId) {
        recipients = [...new Set([recipientId, user.id])];
        conversation = await getConversationOrCreate(recipients);
      } else if (conversationId) {
        conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          return {
            success: false,
            code: 404,
            message: req.t("Conversation does not exist!"),
          };
        }
        recipients = conversation.participants.map((id) => id.toString());
      } else {
        return { success: false, code: 400, message: req.t("Invalid input!") };
      }

      const maxMessage = await addMessage({
        sender: user.id,
        content,
        conversation: conversation.id.toString(),
      });

      conversation.maxMessage = maxMessage;
      await updateLastMessage(conversation.id, maxMessage.id);
      await populateConversation(conversation);

      doEvents({
        eventData: {
          type: "message",
          op: "add",
          event: maxMessage,
          recipients: recipients.filter(
            (participant) => participant !== user.id
          ),
        },
      });

      createSubscriptions({
        messageId: maxMessage.id,
        recipientIds: recipients,
        conversationId: conversation.id,
        senderId: user.id,
      });

      return {
        success: true,
        code: 200,
        conversation: conversation,
        message: req.t("Message sent successfully!"),
      };
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: req.t("Failed to send message"),
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => MessageResponse)
  async getMessagesByConversationId(
    @Arg("conversationId") conversationId: string,
    @Ctx() { req, user }: Context
  ): Promise<MessageResponse> {
    try {
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        throw new Error(req.t("conversation not found"));
      }

      const subscriptions = await SubscriptionModel.find({
        conversation: conversationId,
        user: user.id,
      })
        .populate("user")
        .populate("message");

      if (!subscriptions) {
        throw new Error(req.t("user is not subscribed"));
      }

      const messages = await MessageModel.find({
        conversation: conversationId,
      })
        .sort({ timestamp: 1 })
        .populate({ path: "conversation", populate: { path: "participants" } })
        .populate({ path: "sender", populate: { path: "role" } });

      const subscriptionMap = new Map(
        subscriptions.map((sub) => [sub.message.id.toString(), sub])
      );

      const messageData: MessageData[] = messages.reduce((acc, message) => {
        const status = subscriptionMap.get(message.id.toString());
        if (status) acc.push({ message, status });
        return acc;
      }, [] as MessageData[]);

      return {
        success: true,
        code: 200,
        message: req.t("Successfully!"),
        data: messageData,
        conversation,
      };
    } catch (error) {
      throw new Error(req.t("Failed to fetch messages"));
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => GetConversationsResponse)
  async getAllConversations(
    @Ctx() { req, user }: Context
  ): Promise<GetConversationsResponse> {
    try {
      const conversations = await ConversationModel.find({
        participants: user.id,
      })
        .populate({ path: "participants", populate: { path: "role" } })
        .populate({ path: "maxMessage", populate: { path: "sender" } });
      console.log({ conversations });

      const subscriptions = await SubscriptionModel.find({
        user: user.id,
      })
        .populate("user")
        .populate("message");

      const filteredConversations = conversations.map((conversation) => {
        let name: string = "";
        conversation.participants.forEach((participant: any, index: number) => {
          if (conversation.name === null || conversation.name === "") {
            if (conversation.participants.length > 2) {
              if (index > 0) {
                name += ", ";
              }
              name += participant.userName;
            }
          }
          return participant.id.toString() !== user.id;
        });

        const seen = new Set();
        const filteredParticipants = conversation.participants.filter(
          (item: any) => {
            console.log({ item });
            if (seen.has(item.id.toString())) return false;
            seen.add(item.id.toString());
            return true;
          }
        );

        if (
          conversation.participants.length == 2 &&
          (conversation.name === null || conversation.name === "")
        ) {
          name = filteredParticipants[0].userName ?? "";
        } else {
          name = conversation.name;
        }

        console.log({ subscriptions });

        return {
          id: conversation._id.toString(),
          name: name,
          participants: filteredParticipants,
          maxMessage: conversation.maxMessage,
          status: subscriptions.find(
            (s) =>
              s.message?.id.toString() ===
              conversation.maxMessage?.id.toString()
          ),
        };
      });

      return {
        code: 200,
        success: true,
        data: filteredConversations,
      };
    } catch (error) {
      console.log(error);
      throw new Error(req.t("Failed to fetch conversations"));
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => ResponseData)
  async createConversation(
    @Arg("participantIds", () => [String]) participantIds: string[],
    @Arg("conversationName") conversationName: string,
    @Ctx() { req, user }: Context
  ): Promise<ResponseData> {
    try {
      if (participantIds.length < 1) {
        return {
          success: false,
          code: 404,
          message: req.t("Recipients is required!"),
        };
      }

      const newConversation = new ConversationModel({
        name: conversationName,
        maxMessage: "",
        participants: [...participantIds, user.id],
      });

      const maxMessage = new MessageModel({
        sender: user.id,
        content: req.t("{{userName}} has been created successfully", {
          userName: user.userName,
        }),
        conversation: newConversation._id.toString(),
      });
      newConversation.maxMessage = maxMessage;
      newConversation.populate("maxMessage");

      await Promise.all([maxMessage.save(), newConversation.save()]);

      const recipients = [...participantIds, user.id];
      doEvents({
        eventData: {
          type: "conversation",
          op: "add",
          event: newConversation,
          recipients: recipients.filter(
            (participant) => participant !== user.id
          ),
        },
      });

      createSubscriptions({
        messageId: maxMessage.id,
        recipientIds: recipients,
        conversationId: newConversation.id,
        senderId: user.id,
      });

      return {
        success: true,
        code: 200,
        message: req.t("Conversation created successfully {{name}}", {
          name: conversationName,
        }),
      };
    } catch (error) {
      throw new Error("Failed to create conversation");
    }
  }
}
