import { Field, ObjectType } from "type-graphql";
import { IUser } from "../../../models/user/user.model";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  accessToken?: string;
  @Field({ nullable: true })
  refreshToken?: string;
  @Field({ nullable: true })
  user?: IUser;
}
