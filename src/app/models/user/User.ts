import mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
const Schema = mongoose.Schema;
const model = mongoose.model;

@ObjectType()
export class IUser {
  @Field((_type) => ID)
  id: any;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;
  password: string;
  token?: string;
  otp?: string;
  otpExpirationTime?: number;
  tokenVersion?: number;
}

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      require: true,
    },
    userName: {
      type: String,
      require: true,
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
    tokenVersion: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

const User = model<IUser>("users", UserSchema);
export default User;
