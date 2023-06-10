import { JwtPayload } from "jsonwebtoken";

export type UserAuthPayload = JwtPayload & { id: any, username: string, email: string, tokenVersion: number }