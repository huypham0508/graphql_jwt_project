import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";

@ObjectType()
export class IRoom {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => IMessage)
  newMessage: IMessage;

  @Field((_type) => [IUser])
  participants: IUser[];
}

const chatRoomSchema = new Schema<IRoom>({
  name: { type: String },
  newMessage: {  type: Schema.Types.ObjectId, ref: "messages", require: true  },
  participants: [{ type: Schema.Types.ObjectId, ref: "users", require: true }],
});

export const ChatRoomModel = model("chatRooms", chatRoomSchema);
