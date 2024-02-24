import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  email: string;
  @Field()
  userName: string;
  @Field()
  password: string;
}
