import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import i18nextMiddleware from "i18next-http-middleware";

import i18n from "./core/middleware/i18n";
import { uploadImage } from "./core/utils/upload_image";

import { handleUpload } from "./v1/controllers/upload_image.controller";
import v1 from "./v1";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(i18nextMiddleware.handle(i18n));

app.use("/public", express.static(path.join(__dirname, "../../public")));
app.use("/docs", express.static(path.join(__dirname, "../../docs")));
app.post("/upload", uploadImage.fields([{ name: "file", maxCount: 1 }]), handleUpload);

app.use("/api/v1", v1);

export { app, httpServer };
