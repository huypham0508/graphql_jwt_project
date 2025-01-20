import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { doEvents } from "../controllers/events.controller";
import { VerifyTokenAll } from "../../core/middleware/auth";
import { MessageModel } from "../../core/models/chat/message.model";
import ChatRoomModel, { getChatRoom } from "../../core/models/chat/room.model";
import SubscriptionModel, { createSubscriptions } from "../../core/models/chat/subscription.model";
import { Context } from "../../core/types/Context";
import { MessageInput } from "../../core/types/input/chat/MessageInput";
import { NewMessageInput } from "../../core/types/input/chat/NewMessageInput";
import { GetRoomsResponse } from "../../core/types/response/chat/GetRoomResponse";
import { MessageResponse } from "../../core/types/response/chat/MessageResponse";
import { SendNewMessageResponse } from "../../core/types/response/chat/SendNewMessageResponse";
import { ResponseData } from "../../core/types/response/IMutationResponse";

@Resolver()
export class ChatResolver {
  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => SendNewMessageResponse)
  async sendNewMessage(
    @Arg("newMessageInput") messageInput: NewMessageInput,
    @Ctx() { req, user }: Context
  ): Promise<SendNewMessageResponse> {
    try {
      const { content, recipientId } = messageInput;

      if (recipientId === null) {
        return {
          success: false,
          code: 404,
          message: req.t("Recipient not found!"),
        };
      }

      const participants = [recipientId, user.id]
      let room = await getChatRoom(participants);

      const maxMessage = new MessageModel({
        sender: user.id,
        content,
        room: room._id.toString(),
      });

      await maxMessage.save();
      room.maxMessage = maxMessage;
      await room.save();

      await (
        await room.populate({
          path: "maxMessage",
          populate: {
            path: "sender",
            populate: {
              path: "role",
            }
          },
        })
      ).populate({
        path: "participants",
        populate: {
          path: "role",
        }
      });

      doEvents({
        eventData: {
          type: "message",
          op: "add",
          event: maxMessage,
          recipients: [recipientId],
        },
      });

      //create subscriptions
      createSubscriptions({
        messageId: maxMessage.id,
        recipientIds: participants,
        roomId: room.id,
        senderId: user.id,
      });

      return {
        success: true,
        code: 200,
        room: room,
        message: req.t("Message sent successfully!"),
      };
    } catch (error) {
      return {
        success: false,
        code: 404,
        message: req.t("Failed to send message"),
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => ResponseData)
  async sendMessage(
    @Arg("messageInput") messageInput: MessageInput,
    @Ctx() { req, user }: Context
  ): Promise<ResponseData> {
    try {
      const { content, roomId } = messageInput;

      const findRoom = await ChatRoomModel.findById(roomId);

      if (findRoom === null) {
        return {
          success: false,
          code: 404,
          message: req.t("Room does not exist!"),
        };
      }

      const maxMessage = new MessageModel({
        sender: user.id,
        content,
        room: roomId,
      });
      findRoom.maxMessage = maxMessage;

      await Promise.all([findRoom.save(), maxMessage.save()]);

      const recipients = findRoom.participants.map((id) => id.toString())
      doEvents({
        eventData: {
          type: "message",
          op: "add",
          event: maxMessage,
          recipients: recipients.filter((participant) => participant !== user.id),
        },
      });

      createSubscriptions({
        messageId: maxMessage.id,
        recipientIds: recipients,
        roomId: findRoom.id,
        senderId: user.id,
      });

      return {
        success: true,
        code: 200,
        message: req.t("Message sent successfully!"),
      };
    } catch (error) {
      return {
        success: false,
        code: 404,
        message: req.t("Failed to send message"),
      };
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => MessageResponse)
  async getMessagesByRoomId(
    @Arg("roomId") roomId: string,
    @Ctx() {req, user}: Context
  ): Promise<MessageResponse> {
    try {
      const messages = await MessageModel.find({
        room: roomId,
      }).sort({ timestamp: 1 })
        .populate({path: "room", populate: {path: "participants"}})
        .populate({path: "sender", populate: {path: "role"}});

      const subscriptions = await SubscriptionModel.find({
        room: roomId,
        user: user.id,
      }).populate("user").populate("message");

      const messageData = messages.map((message) => {
        const status = subscriptions.find((sub) => sub.message.id.toString() === message.id.toString());
        return {
          message: message,
          status: status,
        };
      });
      return {
        success: true,
        code: 200,
        message: req.t("Successfully!"),
        data: messageData,
      };
    } catch (error) {
      throw new Error(req.t("Failed to fetch messages"));
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Query(() => GetRoomsResponse)
  async getAllRooms(@Ctx() { req, user }: Context): Promise<GetRoomsResponse> {
    try {
      const rooms = await ChatRoomModel.find({
        participants: user.id,
      })
      .populate({path: "participants", populate: {path: "role"}})
      .populate({path: "maxMessage", populate: {path: "sender"}});

      const subscriptions = await SubscriptionModel.find({
        user: user.id,
      }).populate("user").populate("message");

      const filteredRooms = rooms.map((room) => {
        let name: string = "";
        const filteredParticipants = room.participants.filter(
          (participant: any, index: number) => {
            if (room.name === null || room.name === "") {
              if (room.participants.length > 2) {
                if (index > 0) {
                  name += ", ";
                }
                name += participant.userName;
              }
            }
            return participant.id.toString() !== user.id;
          }
        );
        if (room.participants.length == 2) {
          name = filteredParticipants[0].userName ?? "";
        }
        return {
          id: room._id.toString(),
          name: name,
          participants: filteredParticipants,
          maxMessage: room.maxMessage,
          status: subscriptions.find((s) => s.message.id.toString() === room.maxMessage.id.toString())
        };
      });

      return {
        code: 200,
        success: true,
        data: filteredRooms,
      };
    } catch (error) {
      throw new Error(req.t("Failed to fetch rooms"));
    }
  }

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => ResponseData)
  async createRoom(
    @Arg("participantIds", () => [String]) participantIds: string[],
    @Arg("roomName") roomName: string,
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

      const newRoom = new ChatRoomModel({
        name: roomName,
        maxMessage: "",
        participants: [...participantIds, user.id],
      });

      const maxMessage = new MessageModel({
        sender: user.id,
        content: req.t("{{userName}} has been created successfully", {"userName": user.userName}),
        room: newRoom._id.toString(),
      });
      newRoom.maxMessage = maxMessage;
      newRoom.populate("maxMessage");

      await Promise.all([maxMessage.save(), newRoom.save()]);

      const recipients = [...participantIds, user.id]
      doEvents({
        eventData: {
          type: "room",
          op: "add",
          event: newRoom,
          recipients: recipients.filter((participant) => participant !== user.id),
        },
      });

      createSubscriptions({
        messageId: maxMessage.id,
        recipientIds: recipients,
        roomId: newRoom.id,
        senderId: user.id,
      });

      return {
        success: true,
        code: 200,
        message: req.t("Room created successfully {{name}}", { name: roomName}),
      };
    } catch (error) {
      throw new Error("Failed to create room");
    }
  }
}
