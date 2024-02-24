// import mongoose from "mongoose";
import User from "../models/user/User";
import lang from "../../public/language/language.json";
import { Context } from "../types/Context";
import { Auth } from "../middleware/auth";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

@Resolver()
export class GreetingResolver {
  @Query((_return) => String)
  @UseMiddleware(Auth.verifyToken)
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
  @Mutation((_return) => String)
  async getLang(@Arg("langType") langType: String): Promise<string> {
    console.log(langType);
    let getLang;
    switch (langType) {
      case "en":
        getLang = lang["en"];
        break;
      case "vi":
        getLang = lang["vi"];
        break;
      default:
        getLang = lang;
        break;
    }
    return JSON.stringify(getLang);
  }
}
