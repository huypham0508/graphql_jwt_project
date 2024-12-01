import path from "path";

import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import handleRealtimeConnect from "./services/RealtimeService";
import refreshToken from "./routes/refreshToken";
import { uploadImage } from "./utils/uploadImage";
import { handleUpload } from "./controllers/uploadImageController";

let eventQueue: any = {};
const app = express();
const httpServer = createServer(app);

// app.use((req: any, _, next) => {
//   console.log(`Received request: ${req.method} ${req.url}`);
//   console.log(`User: ${req.body}`);
//   next();
// });
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/refreshToken", refreshToken);
app.post(
  "/upload",
  uploadImage.fields([{ name: "file", maxCount: 1 }]),
  handleUpload
);
app.get("/events/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!eventQueue[userId]) {
      eventQueue[userId] = [];
  }

  if (eventQueue[userId].length > 0) {
      const event = eventQueue[userId].shift()
      if (event.event != null) {
        return res.json(event);
      }
      return res.json({ event: null });
  } else {
      const timeoutId = setTimeout(() => {
          return res.json({ event: null });
      }, 30000);

      eventQueue[userId].push({ timeoutId, res });
  }
  return res
});

app.post("/send-event/:userId", (req, res) => {
  const userId = req.params.userId;
  const message  = req.body?.message ?? "";
  const eventData = { event: "new_message", message };

  if (eventQueue[userId] && eventQueue[userId].length > 0) {
      const { res: waitingRes, timeoutId } = eventQueue[userId].shift();
      clearTimeout(timeoutId);
      waitingRes.json(eventData);
  } else {
      eventQueue[userId] = eventQueue[userId] || [];
      eventQueue[userId].push(eventData);
  }

  return res.send("Event sent!");
});

handleRealtimeConnect(httpServer);

export { app, httpServer };
