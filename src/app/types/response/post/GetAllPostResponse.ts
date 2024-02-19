import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../MutationResponse";
import { IPost } from "../../../models/post/Post";

@ObjectType({ implements: IMutationResponse })
export class GetAllPostResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => [IPost], { nullable: true })
  data?: IPost[];
}
