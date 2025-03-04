import { HydratedDocument } from "mongoose";
import { ConfigServer } from "../../../config";
import RoleModel, { IRole } from "../../../core/models/role/role.model";

const getDefaultRole = async (): Promise<HydratedDocument<IRole> | null> => {
  try {
    return await RoleModel.findOne({ name: ConfigServer.DEFAULT_ROLE }).lean();
  } catch (error) {
    throw new Error(`getDefaultRole - error: ${error}`);
  }
};

export {getDefaultRole}