import { IRole } from "../models/role/role.model";

export interface TokenPayLoad {
  id: any;
  email: string;
  userName: string;
  tokenPermissions: string;
  role: IRole,
}
