import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";

// import handleRealtimeConnect from "./services/RealtimeService";
// import { ServerEvents } from "./services/ChatEventsService";

import events from "./routes/events";
import refreshToken from "./routes/refreshToken";

import { handleUpload } from "./controllers/uploadImageController";
import { uploadImage } from "./utils/uploadImage";
import { Auth } from "./middleware/auth";

const app = express();
const httpServer = createServer(app);

app.use((req: any, _, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  console.log(`User: ${req.body}`);
  next();
});
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/refreshToken", refreshToken);
app.use("/events", Auth.verifyTokenRest, events)
app.post(
  "/upload",
  uploadImage.fields([{ name: "file", maxCount: 1 }]),
  handleUpload
);

// handleRealtimeConnect(httpServer);

export { app, httpServer };
