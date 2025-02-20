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
  try {
    await conversation.save();
  } catch (error) {
    throw new Error(`saveConversation - error: ${error}`);
  }
};

const findConversationById = async (
  conversationId: string
): Promise<HydratedDocument<IConversation> | null> => {
  try {
    return await ConversationModel.findById(conversationId);
  } catch (error) {
    throw new Error(`findConversationById - error: ${error}`);
  }
};

const findConversationByParticipants = async (
  participants: any
): Promise<HydratedDocument<IConversation>[]> => {
  try {
    const conversations = await ConversationModel.find({
      participants: participants
    })
      .populate({ path: "participants", populate: { path: "role" } })
      .populate({ path: "maxMessage", populate: { path: "sender" } });

    return conversations;
  } catch (error) {
    throw new Error(`findConversationById - error: ${error}`);
  }
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

const updateConversationMessage = async (
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
    throw new Error(`updateConversationMessage - error: ${error}`);
  }
};

export {
  findConversationById,
  findConversationByParticipants,
  getConversationOrCreate,
  saveConversation,
  populateConversation,
  updateConversationMessage,
};
