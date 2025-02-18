import { InputType, Field } from "type-graphql";

@InputType()
export class NewMessageInput {
  @Field(() => String)
  recipientId: string;

  @Field()
  content: string;
}
