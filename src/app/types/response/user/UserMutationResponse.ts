import { Field, ObjectType } from "type-graphql";
import { IUser } from "../../../models/user/User";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  accessToken?: string;
  @Field({ nullable: true })
  user?: IUser;
}
