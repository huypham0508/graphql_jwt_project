import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import i18nextMiddleware from "i18next-http-middleware";

import events from "./routes/events";
import refreshToken from "./routes/refresh_token";

import i18n from "./middleware/i18n";
import { uploadImage } from "./utils/upload_image";

import { handleUpload } from "./controllers/upload_image.controller";
import { AuthMiddleware } from "./middleware/auth";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(i18nextMiddleware.handle(i18n));

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/refreshToken", refreshToken);
app.use("/events", AuthMiddleware.verifyTokenRest, events)

app.post("/upload", uploadImage.fields([{ name: "file", maxCount: 1 }]), handleUpload);
export { app, httpServer };
