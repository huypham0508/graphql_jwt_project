import { HydratedDocument } from "mongoose";
import { StatusMessage } from "../../../core/enum/status_message.enum";
import SubscriptionModel, {
  ISubscription,
} from "../../../core/models/chat/subscription.model";

/**
 * Tracks message delivery status for users in a chat room.
 *
 * This function is used to record the delivery status of a message for each involved user.
 *
 * @param {string} messageId - The message ID.
 * @param {string} conversationId - The conversation ID.
 * @param {string} senderId - The sender's ID.
 * @param {string[]} recipientIds - An array of recipient IDs.
 */
const createSubscriptions = async (params: {
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientIds: string[];
}) => {
  const { messageId, conversationId, senderId, recipientIds } = params;
  try {
    const users = [...recipientIds, senderId];

    const subscriptions = users.map((userId) => ({
      user: userId,
      message: messageId,
      conversation: conversationId,
      status:
        userId === senderId ? StatusMessage.SENT : StatusMessage.DELIVERED,
    }));

    await SubscriptionModel.insertMany(subscriptions);
  } catch (error) {
    console.error("Error creating subscriptions:", error);
  }
};

const findSubscriptions = async ({
  conversationId,
  userId,
}: {
  conversationId?: string | any;
  userId: string;
}): Promise<HydratedDocument<ISubscription>[]> => {
  try {
    return await SubscriptionModel.find({
      ...(conversationId && { conversation: conversationId }),
      user: userId,
    })
      .populate("user")
      .populate("message");
  } catch (error) {
    throw new Error(`findConversationById - error: ${error}`);
  }
};

export { createSubscriptions, findSubscriptions };
