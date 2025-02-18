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



export { addMessage };
