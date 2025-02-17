import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class ForgotPasswordResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  accessToken?: string;
}
