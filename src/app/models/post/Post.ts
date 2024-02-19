import mongoose from "mongoose";
import { Field, ID, ObjectType } from "type-graphql";
const Schema = mongoose.Schema;
const model = mongoose.model;

@ObjectType()
export class IPost {
  @Field((_type) => ID)
  id: any;

  @Field()
  userId: string;

  @Field({ nullable: true })
  imageUrl?: string;
  description?: string;
}

export const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Post = model<IPost>("post", PostSchema);
export default Post;
