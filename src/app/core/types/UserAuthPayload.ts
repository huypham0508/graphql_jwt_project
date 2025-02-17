import { JwtPayload } from "jsonwebtoken";
import { IRole } from "../models/role/role.model";

export type UserAuthPayload = JwtPayload & {
  id: any;
  userName: string;
  email: string;
  role: IRole;
  tokenPermissions: string,
};
