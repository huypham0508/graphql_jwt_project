import path from "path";

import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import handleRealtimeConnect from "./realtime";
import refreshToken from "./routes/refreshToken";
import { uploadImage } from "./utils/uploadImage";
import { handleUpload } from "./controllers/uploadImageController";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/refreshToken", refreshToken);
app.post(
  "/upload",
  uploadImage.fields([{ name: "file", maxCount: 1 }]),
  handleUpload
);

handleRealtimeConnect(httpServer);

export { app, httpServer };
