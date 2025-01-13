import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IRoom } from "../../../models/chat/room.model";

@ObjectType({ implements: IMutationResponse })
export class SendNewMessageResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field((_type) => IRoom, { nullable: true })
  room?: IRoom;
}
