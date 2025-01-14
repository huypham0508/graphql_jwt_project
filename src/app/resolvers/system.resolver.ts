import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { MetadataStorage } from "type-graphql/dist/metadata/metadata-storage";
import { verifyTokenAll } from "../middleware/auth";
import User from "../models/user/user.model";
import { Context } from "../types/Context";
import { AllResolverResponse } from "../types/response/system/AllResolverResponse";

@Resolver()
export class SystemResolver {
  @Query((_return) => AllResolverResponse)
  @UseMiddleware(verifyTokenAll)
  async allResolvers(@Ctx() context: Context): Promise<AllResolverResponse> {
    const id = context.user.id;
    const data = await User.findOne({
      _id: id,
    });
    console.log(data?.userName);
    const metadata = (global as any)
      .TypeGraphQLMetadataStorage as MetadataStorage;
    const queries = metadata.queries.map((q) => ({
      name: q.methodName,
      resolver: q.target.name,
      type: "Query",
    }));

    const mutations = metadata.mutations.map((m) => ({
      name: m.methodName,
      resolver: m.target.name,
      type: "Mutation",
    }));

    const subscriptions = metadata.subscriptions.map((s) => ({
      name: s.methodName,
      resolver: s.target.name,
      type: "Subscription",
    }));
    return {
      code: 200,
      success: true,
      data: [...queries, ...mutations, ...subscriptions],
    };
  }
}
