import { InputType, Field } from "type-graphql";

@InputType()
export class SendMessageInput  {
  @Field()
  content: string;

  @Field({ nullable: true })
  conversationId?: string;

  @Field({ nullable: true })
  recipientId?: string;
}
