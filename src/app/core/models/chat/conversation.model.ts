import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import ModelName from "../../../core/constants/model_name";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";

@ObjectType()
export class IConversation {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => IMessage)
  maxMessage: IMessage;

  @Field((_type) => [IUser])
  participants: IUser[];
}

const conversationSchema = new Schema<IConversation>({
  name: { type: String, default: "" },
  maxMessage: {
    type: Schema.Types.ObjectId,
    ref: ModelName.MESSAGE,
    require: true,
  },
  participants: [
    { type: Schema.Types.ObjectId, ref: ModelName.USER, require: true },
  ],
});


const ConversationModel = model(ModelName.CONVERSATION, conversationSchema);
export default ConversationModel;
