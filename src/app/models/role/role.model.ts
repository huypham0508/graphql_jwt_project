import mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";

const Schema = mongoose.Schema;
const model = mongoose.model;


@ObjectType()
export class IRole {
  @Field((_type) => ID)
  id: string;

  @Field()
  name: string;

  @Field((_type) => [String])
  permissions: string[];
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

const RoleModel = model<IRole>("roles", RoleSchema);
export default RoleModel;
