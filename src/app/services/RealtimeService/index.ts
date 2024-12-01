import { Server, Socket } from "socket.io";

export const getReceiverSocketId = (receiverId: string) => {
  return connectedUsers.get(receiverId);
};

const connectedUsers: Map<string, Socket> = new Map();

const handleRealtimeConnect = async (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  try {
    io.on("connection", (socket: Socket) => {
      socket.on("login", (userId: string) => {
        connectedUsers.set(userId, socket);
        console.log(`User ${userId} connected`);
      });

      socket.on("logout", (userId: string) => {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
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
          }
        });
      });
    });
  } catch (error) {
    console.log({ error });
  }
};
export { connectedUsers };
export default handleRealtimeConnect;
