import mongoose, { Schema } from "mongoose";

import { registerEnumType, Field, ID, ObjectType } from "type-graphql";
import { IUser } from "../user/user.model";
import { FriendStatus } from "../../../core/enum/friend.enum";
import ModelName from "../../../core/constants/model_name";

registerEnumType(FriendStatus, {
  name: "FriendStatus",
  description: "The status of the friendship",
});

@ObjectType()
export class IFriend {
  @Field((_type) => ID)
  id: string;

  @Field((_type) => IUser)
  user: IUser;

  @Field((_type) => IUser)
  friend: IUser;

  @Field((_type) => FriendStatus)
  status: FriendStatus;
}

const FriendSchema: Schema = new Schema<IFriend>({
  user: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
  friend: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
  status: {
    type: String,
    enum: Object.values(FriendStatus),
    default: FriendStatus.PENDING,
  },
});

export const FriendModel = mongoose.model<IFriend>(ModelName.FRIEND, FriendSchema);
