import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";
import ModelName from "../../constants/model_name";

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
  name: { type: String },
  maxMessage: {  type: Schema.Types.ObjectId, ref: ModelName.MESSAGE, require: true  },
  participants: [{ type: Schema.Types.ObjectId, ref: ModelName.USER, require: true }],
});

export const ChatRoomModel = model(ModelName.CHAT_ROOM, chatRoomSchema);
