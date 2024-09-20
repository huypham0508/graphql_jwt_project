import { connectedUsers } from "../realtime";

export default class Helper {
  static sendNotification({
    recipients,
    sender,
    content,
    payload,
  }: {
    sender: string;
    content: string;
    payload?: any;
    recipients: any[];
  }) {
    recipients.forEach((recipient) => {
      const isString = typeof recipient === "string";
      const getRecipient = isString ? recipient : recipient.id;

      if (getRecipient !== sender) {
        const recipientSocket = connectedUsers.get(getRecipient);
        if (recipientSocket) {
          recipientSocket.emit("notification", {
            ...payload,
            message: content,
          });
        }
      }
    });
  }
}
