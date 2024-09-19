import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IReaction } from "../../../models/reaction/reaction.model.ts";

@ObjectType({ implements: IMutationResponse })
export class GetReactionsResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => [IReaction], { nullable: true })
  data?: IReaction[];
}
