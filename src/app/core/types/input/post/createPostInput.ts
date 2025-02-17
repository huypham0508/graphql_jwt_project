import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  imageUrl?: string;

  @Field()
  description?: string;
}
