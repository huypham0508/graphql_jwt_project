import { InterfaceType, Field, ObjectType } from "type-graphql";

@InterfaceType()
export abstract class IMutationResponse {
  @Field()
  code: number;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType({ implements: IMutationResponse })
export class ResponseData implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;
}
