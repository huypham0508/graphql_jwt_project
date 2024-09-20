import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";

@ObjectType()
export class IRoom {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  newMessage: string;

  @Field((_type) => [IUser])
  participants: IUser[];
}

const chatRoomSchema = new Schema<IRoom>({
  name: { type: String },
  newMessage: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

export const ChatRoomModel = model("chatRooms", chatRoomSchema);
