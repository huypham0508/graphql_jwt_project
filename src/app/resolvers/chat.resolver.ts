import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { MessageModel } from "../models/chat/message.model";
import { MessageInput } from "../types/input/chat/MessageInput";
import { ResponseData } from "../types/response/IMutationResponse";
import { verifyTokenAll } from "../middleware/auth";
import { connectedUsers } from "../realtime";
import { ChatRoomModel } from "../models/chat/room.model";
import { Context } from "../types/Context";
import { MessageResponse } from "../types/response/chat/messageResponse";
import { GetRoomsResponse } from "../types/response/chat/getRoomResponse";
import { NewMessageInput } from "../types/input/chat/NewMessageInput";

@Resolver()
export class ChatResolver {
  @UseMiddleware(verifyTokenAll)
  @Mutation(() => ResponseData)
  async sendNewMessage(
    @Arg("newMessageInput") messageInput: NewMessageInput,
    @Ctx() { user }: Context
  ): Promise<ResponseData> {
    try {
      const { content, recipient } = messageInput;

      if (recipient === null) {
        return {
          success: false,
          code: 404,
          message: "recipient not found!",
        };
      }

      const newRoom = new ChatRoomModel({
        name: "",
        participants: [recipient, user.id],
      });
      const newMessage = new MessageModel({
        sender: user.id,
        content,
        room: newRoom._id.toString(),
      });
      await Promise.all([newRoom.save(), newMessage.save()]);

      //send notification
      const recipientSocket = connectedUsers.get("messageInput.recipient");
      if (recipientSocket) {
        recipientSocket.emit("notification", messageInput.content);
      }

      return {
        success: true,
        code: 200,
        message: "Message sent successfully!",
      };
    } catch (error) {
      return {
        success: false,
        code: 404,
        message: "Failed to send message",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => ResponseData)
  async sendMessage(
    @Arg("messageInput") messageInput: MessageInput,
    @Ctx() { user }: Context
  ): Promise<ResponseData> {
    try {
      const { content, roomId } = messageInput;

      if (roomId === null) {
        return {
          success: false,
          code: 404,
          message: "Room does not exist!",
        };
      }

      const newMessage = new MessageModel({
        sender: user.id,
        content,
        room: roomId,
      });

      await newMessage.save();

      //send notification
      const recipientSocket = connectedUsers.get("messageInput.recipient");
      if (recipientSocket) {
        recipientSocket.emit("notification", messageInput.content);
      }

      return {
        success: true,
        code: 200,
        message: "Message sent successfully!",
      };
    } catch (error) {
      return {
        success: false,
        code: 404,
        message: "Failed to send message",
      };
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Query(() => MessageResponse)
  async getMessagesByRoomId(
    @Arg("roomId") roomId: string
  ): Promise<MessageResponse> {
    try {
      const messages = await MessageModel.find({
        room: roomId,
      })
        .sort({ timestamp: 1 })
        .populate(["room", "sender"]);

      return {
        success: true,
        code: 200,
        message: "Message sent successfully!",
        data: messages,
      };
    } catch (error) {
      throw new Error("Failed to fetch messages");
    }
  }
  //rooms
  @UseMiddleware(verifyTokenAll)
  @Query(() => GetRoomsResponse)
  async getAllRooms(@Ctx() { user }: Context): Promise<GetRoomsResponse> {
    try {
      const rooms = await ChatRoomModel.find({
        participants: user.id,
      }).populate("participants");

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
          ...room.toObject(),
          id: room._id.toString(),
          name: name,
          participants: filteredParticipants,
        };
      });

      return {
        code: 200,
        success: true,
        data: filteredRooms,
      };
    } catch (error) {
      throw new Error("Failed to fetch rooms");
    }
  }

  @UseMiddleware(verifyTokenAll)
  @Mutation(() => ResponseData)
  async createRoom(
    @Arg("participantIds", () => [String]) participantIds: string[],
    @Arg("roomName") roomName: string,
    @Ctx() { user }: Context
  ): Promise<ResponseData> {
    try {
      const newRoom = new ChatRoomModel({
        name: roomName,
        participants: [...participantIds, user.id],
      });

      await newRoom.save();

      return {
        success: true,
        code: 200,
        message: "Room created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create room");
    }
  }
}
