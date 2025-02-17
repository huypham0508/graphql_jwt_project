import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MetadataStorage } from "type-graphql/dist/metadata/metadata-storage";
import { VerifyTokenAll } from "../../core/middleware/auth";
import Role from "../../core/models/role/role.model";
import { Context } from "../../core/types/Context";
import { ResponseData } from "../../core/types/response/IMutationResponse";
import { AllResolverResponse } from "../../core/types/response/system/AllResolverResponse";
import { RolesResponse } from "../../core/types/response/system/RolesResponse";

@Resolver()
export class SystemResolver {
  @Query((_return) => AllResolverResponse)
  @UseMiddleware(VerifyTokenAll)
  async allResolvers(@Ctx() _: Context): Promise<AllResolverResponse> {
    const metadata = (global as any).TypeGraphQLMetadataStorage as MetadataStorage;
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

  @Query((_return) => RolesResponse)
  @UseMiddleware(VerifyTokenAll)
  async roles(): Promise<RolesResponse> {
    try {
      const roles = await Role.find();
      if (roles.length == 0) {
        return {
          code: 200,
          success: true,
          message: "roles is empty",
        };
      }
      return {
        code: 200,
        success: true,
        message: "successfully",
        data: roles,
      };
    } catch (error) {
      throw new Error("Could not fetch posts");
    }
  }


  @UseMiddleware(VerifyTokenAll)
  @Mutation(() => ResponseData)
  async addPermissionToRole(
    @Arg("roleId") roleId: string,
    @Arg("permission") permission: string
  ): Promise<ResponseData> {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        return {
          success: false,
          code: 404,
          message: "Role not found",
        };
      }

      if (role.permissions.includes(permission)) {
        return {
          success: false,
          code: 400,
          message: "Permission already exists",
        };
      }

      role.permissions.push(permission);
      await role.save();

      return {
        success: true,
        code: 200,
        message: "Permission added successfully",
      };
    } catch (error) {
      console.error("Error adding permission to role:", error);
      return {
        success: false,
        code: 500,
        message: "Internal server error",
      };
    }
  }
}
