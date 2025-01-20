import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  username?: string;
  @Field({ nullable: true })
  avatar?: string;
}
