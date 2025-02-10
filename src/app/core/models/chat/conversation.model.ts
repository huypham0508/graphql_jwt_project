import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";
import ModelName from "../../../core/constants/model_name";

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

export const getConversationOrCreate : any = async (participants: string[]) => {
  let conversation = await ConversationModel.findOne({
    participants: { $all: participants },
  });
    if (!conversation) {
      conversation = new ConversationModel({
        participants,
      });
      await conversation.save();
    }
    return conversation;
};

const ConversationModel = model(ModelName.CONVERSATION, conversationSchema);
export default ConversationModel;
