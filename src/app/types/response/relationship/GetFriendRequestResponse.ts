import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../MutationResponse";
import { IFriend } from "../../..//models/friend/friend.model";

@ObjectType({ implements: IMutationResponse })
export class GetFriendRequestResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => [IFriend], { nullable: true })
  data?: IFriend[];
}
