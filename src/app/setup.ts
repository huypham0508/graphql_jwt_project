import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const connectedUsers: Map<string, Socket> = new Map();

try {
  io.on("connection", (socket: Socket) => {
    setInterval(() => {
      socket.emit("connected", {
        message: "Connected",
        success: true,
      });
    }, 1000);

    socket.on("login", (userId: string) => {
      connectedUsers.set(userId, socket);
      console.log(`User ${userId} connected`);
    });

    socket.on("sendNotification", (userId: string, message: string) => {
      const userSocket = connectedUsers.get(userId);
      if (userSocket) {
        userSocket.emit("notification", message);
        console.log(`Notification sent to user ${userId}: ${message}`);
      } else {
        console.log(`User ${userId} is not connected`);
      }
    });

    socket.on("disconnect", () => {
      console.log("A client disconnected");
      connectedUsers.forEach((value, key) => {
        if (value === socket) {
          console.log({
            value,
            socket,
          });
          connectedUsers.delete(key);
          console.log(`User ${key} disconnected`);
        }
      });
    });
  });
} catch (error) {
  console.log({ error });
}

export { app, httpServer };
