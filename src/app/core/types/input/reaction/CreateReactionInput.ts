import { Field, InputType } from "type-graphql";

@InputType()
export class CreateReactionInput {
  @Field()
  name: string;

  @Field()
  imageURL: string;
}
