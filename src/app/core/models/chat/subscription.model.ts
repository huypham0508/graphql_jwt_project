import { Schema, model } from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import ModelName from "../../../core/constants/model_name";
import { IUser } from "../user/user.model";
import { IMessage } from "./message.model";
import { IRoom } from "./room.model";
import { StatusMessage } from "../../../core/enum/status_message.enum";

@ObjectType()
export class ISubscription {
  @Field((_type) => ID)
  id: string;

  @Field((_type) => IUser)
  user: IUser;

  // @Field((_type) => IMessage)
  message: IMessage;

  // @Field()
  status:
    | StatusMessage.SENT
    | StatusMessage.DELIVERED
    | StatusMessage.SEEN
    | StatusMessage.ERROR;

  // @Field()
  room: IRoom;

  @Field()
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        StatusMessage.SENT,
        StatusMessage.DELIVERED,
        StatusMessage.SEEN,
        StatusMessage.ERROR,
      ],
    },
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
    message: {
      type: Schema.Types.ObjectId,
      ref: ModelName.MESSAGE,
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: ModelName.CHAT_ROOM,
      required: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const SubscriptionModel = model(ModelName.SUBSCRIPTION, subscriptionSchema);

/**
 * Tracks message delivery status for users in a chat room.
 *
 * This function is used to record the delivery status of a message for each involved user.
 *
 * @param {string} messageId - The message ID.
 * @param {string} roomId - The chat room ID.
 * @param {string} senderId - The sender's ID.
 * @param {string[]} recipientIds - An array of recipient IDs.
 */
export const createSubscriptions = async (params: {
  messageId: string,
  roomId: string,
  senderId: string,
  recipientIds: string[]}
) => {
  const {messageId, roomId, senderId, recipientIds} = params;
  try {
    const users = [...recipientIds, senderId];

    const subscriptions = users.map((userId) => ({
      user: userId,
      message: messageId,
      room: roomId,
      status: userId === senderId ? StatusMessage.SENT : StatusMessage.DELIVERED,
    }));

    await SubscriptionModel.insertMany(subscriptions);
    console.log("Subscriptions created successfully:", subscriptions);
  } catch (error) {
    console.error("Error creating subscriptions:", error);
  }
};


export default SubscriptionModel;
