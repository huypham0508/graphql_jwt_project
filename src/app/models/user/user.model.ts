import mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IRole } from "../role/role.model";

const Schema = mongoose.Schema;
const model = mongoose.model;

@ObjectType()
export class IUser {
  @Field((_type) => ID)
  id: any;

  @Field((_type) => IRole)
  role: IRole;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  password?: string;
  token?: string;
  otp?: string;
  otpExpirationTime?: number;
}

export const UserSchema = new Schema<IUser>(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    userName: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      require: true,
    },
    token: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpirationTime: {
      type: Number,
    },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("users", UserSchema);
export default UserModel;
