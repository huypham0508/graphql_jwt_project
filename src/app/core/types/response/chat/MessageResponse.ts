import { ISubscription } from "../../../models/chat/subscription.model";
import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IMessage } from "../../../models/chat/message.model";
import { IConversation } from "../../../models/chat/conversation.model";

@ObjectType()
export class MessageData {
  @Field((_type) => ISubscription)
  status?: ISubscription;

  @Field((_type) => IMessage)
  message?: IMessage;
}

@ObjectType({ implements: IMutationResponse })
export class MessageResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field((_type) => [MessageData], { nullable: true })
  data?: MessageData[];

  @Field((_type) => IConversation)
  conversation?: IConversation;
}
