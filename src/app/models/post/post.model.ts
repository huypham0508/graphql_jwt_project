import mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
import { IReaction, reactionSchema } from "../reaction/reaction.model.ts";
import { IUser } from "../user/user.model";
import ModelName from "../../constants/model_name";

const Schema = mongoose.Schema;
const model = mongoose.model;

@ObjectType()
export class IPost {
  @Field((_type) => ID)
  id: any;

  @Field((_type) => IUser)
  user: IUser;

  @Field((_type) => [IReaction])
  reactions: IReaction[];

  @Field({ nullable: true })
  imageUrl?: string;
  @Field({ nullable: true })
  description?: string;
}

export const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

const PostModel = model<IPost>(ModelName.POST, PostSchema);
export default PostModel;
