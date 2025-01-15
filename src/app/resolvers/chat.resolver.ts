import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { VerifyTokenAll } from "../middleware/auth";
import { MessageModel } from "../models/chat/message.model";
import { ChatRoomModel } from "../models/chat/room.model";
import { Context } from "../types/Context";
import { MessageInput } from "../types/input/chat/MessageInput";
import { NewMessageInput } from "../types/input/chat/NewMessageInput";
import { GetRoomsResponse } from "../types/response/chat/GetRoomResponse";
import { MessageResponse } from "../types/response/chat/MessageResponse";
import { ResponseData } from "../types/response/IMutationResponse";
import { SendNewMessageResponse } from "../types/response/chat/SendNewMessageResponse";
import { doEvents } from "../controllers/events.controller";

@Resolver()
export class ChatResolver {
  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => SendNewMessageResponse)
  async sendNewMessage(
    @Arg("newMessageInput") messageInput: NewMessageInput,
    @Ctx() { user }: Context
  ): Promise<SendNewMessageResponse> {
    try {
      const { content, name, recipientId } = messageInput;

      if (recipientId === null) {
        return {
          success: false,
          code: 404,
          message: "recipient not found!",
        };
      }

      let newRoom = new ChatRoomModel({
        name: name ?? "",
        newMessage: "",
        participants: [recipientId, user.id],
      });

      let newMessage = new MessageModel({
        sender: user.id,
        content,
        room: newRoom._id.toString(),
      });
      newRoom.newMessage = newMessage;

      await Promise.all([newMessage.save(), newRoom.save()]);

      await (
        await newRoom.populate({
          path: "newMessage",
          populate: {
            path: "sender",
          },
        })
      ).populate({
        path: "participants",
      });

      // send notification
      doEvents({
        eventData: {
          type: "message",
          event: newRoom,
          recipients: [recipientId],
        },
      });

      return {
        success: true,
        code: 200,
        room: newRoom,
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

  @UseMiddleware(VerifyTokenAll)
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
      findRoom.newMessage = newMessage;
      findRoom;
      newMessage;
      // await findRoom.save();
      // await newMessage.save();

      // send notification
      // Socket.sendNotification({
      //   content,
      //   recipients: findRoom?.participants,
      //   sender: user.id,
      // });

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

  @UseMiddleware(VerifyTokenAll)
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

  @UseMiddleware(VerifyTokenAll)
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

  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => ResponseData)
  async createRoom(
    @Arg("participantIds", () => [String]) participantIds: string[],
    @Arg("roomName") roomName: string,
    @Ctx() { user }: Context
  ): Promise<ResponseData> {
    try {
      if (participantIds.length < 1) {
        return {
          success: false,
          code: 404,
          message: "recipients is required",
        };
      }

      const newRoom = new ChatRoomModel({
        name: roomName,
        newMessage: "",
        participants: [...participantIds, user.id],
      });
      const newMessage = new MessageModel({
        sender: user.id,
        content: `${user.userName} has been created successfully`,
        room: newRoom._id.toString(),
      });
      newRoom.newMessage = newMessage;
      newRoom.populate("newMessage");

      // await Promise.all([newMessage.save(), newRoom.save()]);

      // Socket.sendNotification({
      //   content: "Room created",
      //   recipients: participantIds,
      //   sender: user.id,
      // });

      // Socket.updateRoom({
      //   recipients: participantIds,
      //   sender: user.id,
      //   payload: newRoom.toObject(),
      // });

      return {
        success: true,
        code: 200,
        message: `Room created successfully ${newRoom.name}`,
      };
    } catch (error) {
      throw new Error("Failed to create room");
    }
  }
}
