import { HydratedDocument } from "mongoose";
import { ConfigServer } from "src/app/config";
import RoleModel, { IRole } from "src/app/core/models/role/role.model";

const getDefaultRole = async (): Promise<HydratedDocument<IRole> | null> => {
  try {
    return await RoleModel.findOne({ name: ConfigServer.DEFAULT_ROLE }).lean();
  } catch (error) {
    throw new Error(`getDefaultRole - error: ${error}`);
  }
};

export {getDefaultRole}