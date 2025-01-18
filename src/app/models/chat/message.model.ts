import mongoose, { Schema } from "mongoose";

import { Field, ID, ObjectType } from "type-graphql";
import { IRoom } from "./room.model";
import { IUser } from "../user/user.model";
import ModelName from "../../constants/model_name";

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
  content: {
    type: String,
  },
  room: { type: Schema.Types.ObjectId, ref: ModelName.CHAT_ROOM, required: true },
}, {
  timestamps: true,
});

export const MessageModel = mongoose.model<IMessage>(ModelName.MESSAGE, MessageSchema);
