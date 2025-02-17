import { IMessage } from "../../../models/chat/message.model";
import { ISubscription } from "../../../models/chat/subscription.model";
import { IUser } from "../../../models/user/user.model";
import { Field, ID, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType()
class ConversationData {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => IMessage)
  maxMessage: IMessage;

  @Field((_type) => [IUser])
  participants: IUser[];

  @Field((_type) => ISubscription)
  status?: ISubscription;
}

@ObjectType({ implements: IMutationResponse })
export class GetConversationsResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field((_type) => [ConversationData], { nullable: true })
  data?: ConversationData[];
}
