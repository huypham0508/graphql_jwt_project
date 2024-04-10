import { JwtPayload } from "jsonwebtoken";

export type UserAuthPayload = JwtPayload & {
  id: any;
  userName: string;
  email: string;
  tokenVersion: number;
  role: string;
};
