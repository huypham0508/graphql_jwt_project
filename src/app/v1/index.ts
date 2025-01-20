import events from "./routes/events";
import refreshToken from "./routes/refresh_token";

import { AuthMiddleware } from "../core/middleware/auth";
import { Router } from "express";

const v1 = Router();
v1.use("/refreshToken", refreshToken);
v1.use("/events", AuthMiddleware.verifyTokenRest, events)

export default v1;