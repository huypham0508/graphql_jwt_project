import mongoose from "mongoose";
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

const ReactionModel = model<IReaction>("reaction", reactionSchema);
export default ReactionModel;
