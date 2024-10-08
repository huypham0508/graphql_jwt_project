import { ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class RelationshipResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;
}
