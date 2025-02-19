import { Router } from "express";
import { handleRefreshToken } from "../controllers/refresh_token.controller";

const refreshToken = Router();
refreshToken.get("/", handleRefreshToken);
export default refreshToken;
