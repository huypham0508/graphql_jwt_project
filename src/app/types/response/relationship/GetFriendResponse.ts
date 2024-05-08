import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../MutationResponse";
import { IUser } from "../../../models/user/user.model";

@ObjectType({ implements: IMutationResponse })
export class GetFriendsResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => [IUser], { nullable: true })
  data?: IUser[];
}
