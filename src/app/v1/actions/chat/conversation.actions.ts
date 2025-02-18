import { HydratedDocument } from "mongoose";
import ConversationModel, {
  IConversation,
} from "../../../core/models/chat/conversation.model";

const getConversationOrCreate = async (
  participants: string[]
): Promise<HydratedDocument<IConversation>> => {
  try {
    let conversation = await ConversationModel.findOne({
      participants: { $all: participants },
    });
    if (!conversation) {
      conversation = new ConversationModel({
        participants,
      });
      await conversation.save();
    }
    return conversation;
  } catch (error) {
    throw new Error(`getConversationOrCreate - error: ${error}`);
  }
};

const saveConversation = async (
  conversation: HydratedDocument<IConversation>
): Promise<void> => {
  await conversation.save();
};

const populateConversation = async (
  conversation: HydratedDocument<IConversation>
): Promise<void> => {
  try {
    await (
      await conversation.populate({
        path: "maxMessage",
        populate: {
          path: "sender",
          populate: {
            path: "role",
          },
        },
      })
    ).populate({
      path: "participants",
      populate: {
        path: "role",
      },
    });
  } catch (error) {
    throw new Error(`populateConversation - error: ${error}`);
  }
};

const updateLastMessage = async (
  conversationId: string,
  messageId: string
): Promise<IConversation | null> => {
  try {
    return await ConversationModel.findByIdAndUpdate(
      conversationId,
      { maxMessage: messageId },
      { new: true }
    );
  } catch (error) {
    throw new Error(`updateLastMessage - error: ${error}`);
  }
};

export {
  getConversationOrCreate,
  saveConversation,
  populateConversation,
  updateLastMessage,
};
