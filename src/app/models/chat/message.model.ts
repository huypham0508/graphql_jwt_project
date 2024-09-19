import mongoose, { Schema } from "mongoose";

import { Field, ID, ObjectType } from "type-graphql";
import { IRoom } from "./room.model";
import { IUser } from "../user/user.model";

@ObjectType()
export class IMessage {
  @Field((_type) => ID)
  id: string;

  @Field((_type) => IUser)
  sender: IUser;

  @Field()
  content: string;

  @Field(() => IRoom)
  room: IRoom;
}

const MessageSchema: Schema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "users", required: true },
  content: {
    type: String,
  },
  room: { type: Schema.Types.ObjectId, ref: "chatRooms", required: true },
});

export const MessageModel = mongoose.model<IMessage>("messages", MessageSchema);
