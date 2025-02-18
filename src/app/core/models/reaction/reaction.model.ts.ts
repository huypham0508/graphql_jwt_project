import mongoose from "mongoose";
import ModelName from "../../../core/constants/model_name";
import { Field, ID, ObjectType } from "type-graphql";
const Schema = mongoose.Schema;
const model = mongoose.model;

@ObjectType()
export class IReaction {
  @Field((_type) => ID)
  id: any;

  @Field()
  name: string;

  @Field()
  count: number;

  @Field()
  imageURL: string;
}

export const reactionSchema = new Schema({
  name: String,
  count: { type: Number, default: 0 },
  imageURL: String,
});

const ReactionModel = model<IReaction>(ModelName.REACTION, reactionSchema);
export default ReactionModel;
