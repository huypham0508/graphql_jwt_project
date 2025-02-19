import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IPost } from "../../../models/post/post.model";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;
  @Field(() => IPost, { nullable: true })
  data?: IPost;
}
