// import { connectedUsers } from ".";

// export default class Socket {
//   static sendNotification({
//     recipients,
//     sender,
//     content,
//     payload,
//   }: {
//     sender: string;
//     content: string;
//     payload?: any;
//     recipients: any[];
//   }) {
//     recipients.forEach((recipient) => {
//       const isString = typeof recipient === "string";
//       const getRecipient = isString ? recipient : recipient.id;

//       if (getRecipient !== sender) {
//         const recipientSocket = connectedUsers.get(getRecipient);
//         if (recipientSocket) {
//           recipientSocket.emit("notification", {
//             ...payload,
//             message: content,
//           });
//         }
//       }
//     });
//   }

//   static updateRoom({
//     recipients,
//     sender,
//     payload,
//   }: {
//     sender: string;
//     recipients: any[];
//     payload?: any;
//   }) {
//     recipients.forEach((recipient) => {
//       const isString = typeof recipient === "string";
//       const getRecipient = isString ? recipient : recipient.id;

//       if (getRecipient !== sender) {
//         const recipientSocket = connectedUsers.get(getRecipient);
//         if (recipientSocket) {
//           recipientSocket.emit("roomUpdate", {
//             ...payload,
//             message: "",
//           });
//         }
//       }
//     });
//   }
// }
