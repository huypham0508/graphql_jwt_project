import { InputType, Field } from "type-graphql";

@InputType()
export class MessageInput {
  @Field()
  content: string;

  @Field({ nullable: true })
  conversationId?: string;
}
