import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IConversation } from "../../../models/chat/conversation.model";

@ObjectType({ implements: IMutationResponse })
export class SendNewMessageResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field((_type) => IConversation, { nullable: true })
  conversation?: IConversation;
}
