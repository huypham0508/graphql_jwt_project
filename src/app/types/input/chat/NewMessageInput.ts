import { InputType, Field } from "type-graphql";

@InputType()
export class NewMessageInput {
  @Field(() => [String])
  recipientIds: string[];

  @Field()
  content: string;

  @Field({nullable: true})
  name?: string;
}
