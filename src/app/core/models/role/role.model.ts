import mongoose from "mongoose";
import ModelName from "../../../core/constants/model_name";
import { Field, ID, ObjectType } from "type-graphql";

const Schema = mongoose.Schema;
const model = mongoose.model;


@ObjectType()
export class IRole {
  @Field((_type) => ID)
  id: any;

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
const RoleModel = model<IRole>(ModelName.ROLE, RoleSchema);

export const seedRoles = async () => {
  try {
    const roles = await RoleModel.find({});
    if (roles.length === 0) {
      console.log("No roles found, creating default roles...");

      const defaultRoles = [
        { name: "admin", permissions: [] },
        { name: "member", permissions: [] },
      ];

      await RoleModel.insertMany(defaultRoles);
      console.log("Default roles created successfully.");
    } else {
      console.log("Roles already exist.");
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};
export default RoleModel;
