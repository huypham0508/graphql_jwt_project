import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType()
export class FindUserResponse {
  @Field()
  id: string;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  status: string;
}

@ObjectType({ implements: IMutationResponse })
export class FindFriendsResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => [FindUserResponse], { nullable: true })
  data?: FindUserResponse[];
}
