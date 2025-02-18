import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType()
export class ResolverInfo {
  @Field()
  name: string;

  @Field()
  resolver: string;

  @Field()
  type: string;
}

@ObjectType({ implements: IMutationResponse })
export class AllResolverResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field(() => [ResolverInfo], { nullable: true })
    data: ResolverInfo[]
}
