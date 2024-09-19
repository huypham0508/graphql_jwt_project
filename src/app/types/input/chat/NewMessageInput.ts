import { InputType, Field } from "type-graphql";

@InputType()
export class NewMessageInput {
  @Field({ nullable: true })
  recipient?: string;

  @Field()
  content: string;
}
