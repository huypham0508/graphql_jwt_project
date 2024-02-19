import express from "express";
import { createServer } from "http";
import refreshToken from "./routes/refreshToken";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(cookieParser());
const httpServer = createServer(app);
app.use("/refreshToken", refreshToken);

export { app, httpServer };
