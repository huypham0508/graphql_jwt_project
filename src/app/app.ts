import express from "express";
import { createServer } from "http";
import refreshToken from "./routes/refreshToken";
import cookieParser from "cookie-parser";
import cors from "cors";
import { uploadImage } from "./utils/updateImage";
import { handleUpload } from "./controllers/uploadImageController";
import path from "path";

console.log(path.join(__dirname, "../public"));

const app = express();
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(cors());
app.use(cookieParser());
const httpServer = createServer(app);
app.use("/refreshToken", refreshToken);
app.post(
  "/upload",
  uploadImage.fields([{ name: "file", maxCount: 1 }]),
  handleUpload
);

export { app, httpServer };
