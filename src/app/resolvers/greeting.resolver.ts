// import mongoose from "mongoose";
import User from "../models/User";
import { Context } from "../types/Context";
import { Auth } from "../middleware/auth";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";


@Resolver()
export class GreetingResolver {
    @Query(_return => String)
    @UseMiddleware(Auth.verifyToken)
    async hello(@Ctx() context: Context): Promise<String> {
        console.log("hello user");
        const id = context.user.id;
        const data = await User.findOne({
            _id: id
        },
        )
        if (!data) {
            return `data not found`;
        }
        return `hello ${data.userName ?? "world"}`;
    }
}