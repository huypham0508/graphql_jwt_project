import { HydratedDocument } from "mongoose";
import { IMessage, MessageModel } from "../../../core/models/chat/message.model";

interface MessagePayload {
  sender: string;
  content: string;
  conversation: string;
}

const addMessage = async ({
  sender,
  content,
  conversation,
}: MessagePayload): Promise<HydratedDocument<IMessage>> => {
  try {
    const message = new MessageModel({ sender, content, conversation });
    await message.save();
    return message;
  } catch (error) {
    throw new Error(`addMessage - error: ${error}`);
  }
};

const getMessageByConversationId = async ({
  conversationId
}: {conversationId: string}): Promise<HydratedDocument<IMessage>[]> => {
  try {
    const messages = await MessageModel.find({
      conversation: conversationId,
    })
      .sort({ timestamp: 1 })
      .populate({ path: "conversation", populate: { path: "participants" } })
      .populate({ path: "sender", populate: { path: "role" } });
    return messages;
  } catch (error) {
    throw new Error(`getMessageByConversationId - error: ${error}`);
  }
};



export { addMessage, getMessageByConversationId };
