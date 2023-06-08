// import mongoose from "mongoose";
import User from "../models/User";
import { Context } from "../types/Context";
import { Auth } from "../utils/auth";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";


@Resolver()
export class GreetingResolver {
    @Query(_return => String)
    @UseMiddleware(Auth.verifyToken)
    async hello(@Ctx() context: Context): Promise<String> {
        const id = context.user.id;
        const data = await User.findOne({
            _id: id
        },
        )
        if (!data) {
            throw new Error("User not found");
        }
        console.log({ data });
        return `hello ${data.email}`
    }
}