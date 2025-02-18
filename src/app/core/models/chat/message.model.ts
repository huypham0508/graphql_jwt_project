import mongoose, { Schema } from "mongoose";

import { Field, ID, ObjectType } from "type-graphql";
import { IConversation } from "./conversation.model";
import { IUser } from "../user/user.model";
import ModelName from "../../../core/constants/model_name";

@ObjectType()
export class IMessage {
  @Field((_type) => ID)
  id: string;

  @Field((_type) => IUser)
  sender: IUser;

  @Field()
  content: string;

  @Field(() => IConversation)
  conversation: IConversation;

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
  conversation: { type: Schema.Types.ObjectId, ref: ModelName.CONVERSATION, required: true },
}, {
  timestamps: true,
});

export const MessageModel = mongoose.model<IMessage>(ModelName.MESSAGE, MessageSchema);
