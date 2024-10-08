import { IReaction } from "../../../models/reaction/reaction.model.ts";
import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class CreateReactionResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field(() => IReaction, { nullable: true })
  data?: IReaction;
}
