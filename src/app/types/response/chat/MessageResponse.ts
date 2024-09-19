import { IMessage } from "../../../models/chat/message.model";
import { ObjectType, Field } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class MessageResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field((_type) => [IMessage], { nullable: true })
  data?: IMessage[];
}
