import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { verifyTokenAll } from "../middleware/auth";
import { MessageModel } from "../models/chat/message.model";
import { ChatRoomModel } from "../models/chat/room.model";
import { Context } from "../types/Context";
import { MessageInput } from "../types/input/chat/MessageInput";
import { NewMessageInput } from "../types/input/chat/NewMessageInput";
import { GetRoomsResponse } from "../types/response/chat/GetRoomResponse";
import { MessageResponse } from "../types/response/chat/MessageResponse";
import { ResponseData } from "../types/response/IMutationResponse";
import Socket from "../services/RealtimeService/SocketHelper";

@Resolver()
export class ChatResolver {
  @UseMiddleware(verifyTokenAll)
  @Mutation(() => ResponseData)
  async sendNewMessage(
    @Arg("newMessageInput") messageInput: NewMessageInput,
    @Ctx() { user }: Context
  ): Promise<ResponseData> {
    try {
      const { content, recipientId } = messageInput;

      if (recipientId === null) {
        return {
          success: false,
          code: 404,
          message: "recipient not found!",
        };
      }

      const newRoom = new ChatRoomModel({
        name: "",
        newMessage: content,
        participants: [recipientId, user.id],
      });

      const newMessage = new MessageModel({
        sender: user.id,
        content,
        room: newRoom._id.toString(),
      });
      // await Promise.all([newRoom.save(), newMessage.save()]);
      newRoom;
      newMessage;

      //send notification
      Socket.sendNotification({
        content,
        sender: user.id,
        recipients: [recipientId],
      });

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

      const findRoom = await ChatRoomModel.findById(roomId).populate(
        "participants"
      );

      if (findRoom === null) {
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
      findRoom.newMessage = content;
      findRoom;
      newMessage;
      // await findRoom.save();
      // await newMessage.save();

      // send notification
      Socket.sendNotification({
        content,
        recipients: findRoom?.participants,
        sender: user.id,
      });

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
      const newRoom: any = new ChatRoomModel({
        name: roomName,
        newMessage: "",
        participants: [...participantIds, user.id],
      });
      // await newRoom.save();

      Socket.sendNotification({
        content: "Room created",
        recipients: participantIds,
        sender: user.id,
      });

      Socket.updateRoom({
        recipients: participantIds,
        sender: user.id,
        payload: newRoom.toObject(),
      });

      return {
        success: true,
        code: 200,
        message: `Room created successfully ${newRoom}`,
      };
    } catch (error) {
      throw new Error("Failed to create room");
    }
  }
}
