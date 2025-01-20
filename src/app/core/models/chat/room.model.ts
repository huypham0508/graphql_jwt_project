import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";
import ModelName from "../../../core/constants/model_name";

@ObjectType()
export class IRoom {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => IMessage)
  maxMessage: IMessage;

  @Field((_type) => [IUser])
  participants: IUser[];
}

const chatRoomSchema = new Schema<IRoom>({
  name: { type: String, default: "" },
  maxMessage: {  type: Schema.Types.ObjectId, ref: ModelName.MESSAGE, require: true  },
  participants: [{ type: Schema.Types.ObjectId, ref: ModelName.USER, require: true }],
});

export const getChatRoom = async (participants: string[]) =>{
  let room = await ChatRoomModel.findOne({ participants: { $all: participants } });
  if (!room) {
    room = new ChatRoomModel({
      maxMessage: "",
      participants,
    });
    await room.save();
  }
  return room;
}

const ChatRoomModel = model(ModelName.CHAT_ROOM, chatRoomSchema);
export default ChatRoomModel;