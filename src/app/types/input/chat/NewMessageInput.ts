import { InputType, Field } from "type-graphql";

@InputType()
export class NewMessageInput {
  @Field()
  recipientId: string;

  @Field()
  content: string;
}
