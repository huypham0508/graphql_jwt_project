// import mongoose from "mongoose";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { verifyTokenAll } from "../middleware/auth";
import User from "../models/user/user.model";
import { Context } from "../types/Context";

@Resolver()
export class GreetingResolver {
  @Query((_return) => String)
  @UseMiddleware(verifyTokenAll)
  async hello(@Ctx() context: Context): Promise<String> {
    const id = context.user.id;
    const data = await User.findOne({
      _id: id,
    });

    if (!data) {
      return `data not found`;
    }
    return `hello ${data.userName ?? "world"}`;
  }
}
