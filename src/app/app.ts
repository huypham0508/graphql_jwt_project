import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { handleUpload } from "./controllers/uploadImageController";
import refreshToken from "./routes/refreshToken";
import { app } from "./setup";
import { uploadImage } from "./utils/uploadImage";

app.use(cors());
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/refreshToken", refreshToken);
app.post(
  "/upload",
  uploadImage.fields([{ name: "file", maxCount: 1 }]),
  handleUpload
);
