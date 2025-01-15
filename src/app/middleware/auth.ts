import { AuthenticationError } from "apollo-server-express";
import { NextFunction, Response } from "express";
import { decode, Secret, sign, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";

import { ConfigJWT, Role } from "../config/config";

import User, { IUser } from "../models/user/user.model";

import { Context, CustomRequest } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";
import { publicFunctions } from "../resolvers";
import RoleModel from "../models/role/role.model";
import { MetadataStorage } from "type-graphql/dist/metadata/metadata-storage";
import { ResolverMetadata } from "type-graphql/dist/metadata/definitions";

class AuthMiddleware{
  public static createToken = (type: ConfigJWT, user: IUser) => {
    const checkType = type === ConfigJWT.create_token_type;
    let token = sign(
      user,
      checkType
        ? (ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret)
        : (ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret),
      { expiresIn: checkType ? "1d" : "7d" }
    );

    return token ?? "";
  };

  public static sendRefreshToken = (res: Response, user: IUser) => {
    console.log("sending refresh token...");
    const token = this.createToken(ConfigJWT.refresh_token_type, user);
    res.cookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "refreshToken",
    });
    return token;
  };

  public static verifyToken = (requiredRole: string): MiddlewareFn<Context> => async ({ context }, next) => {
    const authHeader = context.req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) throw new AuthenticationError("No token provided");

    const decodedToken = this.decodeAndVerifyToken(token, requiredRole);

    const user = await this.findUser(decodedToken);
    if (!user) throw new AuthenticationError("User not found");

    context.user = decodedToken;
    return next();
  };

  public static verifyTokenRest = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization?.toString();
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
      const decodedToken = this.decodeAndVerifyToken(token, Role.ALL);
      const user = this.findUser(decodedToken);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      req.user = decodedToken;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };

  public static accessedMethod = (): MiddlewareFn<Context> => async ({context, info}, next) => {
    try {
      const { fieldName } = info;
      const { req } = context;
      const parentTypes = ["Query", "Mutation", "Subscription"];
      const parentTypeName = info.parentType.name;

      if (parentTypes.includes(parentTypeName)) {
        if (publicFunctions.includes(fieldName)) {
          return next();
        }
        const parentName = this.getParentClass(info.fieldName, parentTypeName)
        if (publicFunctions.includes(parentName)) {
          return next();
        }

        const authHeader = req.headers.authorization?.toString();
        const token = authHeader?.split(" ")[1];
        if (!token) throw new Error("No token provided");

        const user: any = this.decodeToken(token);
        if (!user) throw new Error("User not found");

        const userRole = await RoleModel.findById(user.role._id);
        if (!userRole) {
          throw new Error("Role not found");
        }

        if (userRole.permissions.includes(parentName)) {
          return next();
        }

        if (!userRole.permissions.includes(fieldName)) {
          return next();
        }

        throw new Error("You do not have permission to access this resource");
      }
      return next();
    } catch (error) {
      throw new Error("Authorization failed: " + error.message);
    }
  };

  private static getParentClass(fieldName: string, parentTypeName: string): string | any {
    const metadata = (global as any).TypeGraphQLMetadataStorage as MetadataStorage;
    switch (parentTypeName) {
      case "Query":
        const queries: ResolverMetadata | undefined = metadata.queries.find((m) => m.methodName === fieldName);
        return queries?.target.name;
      case "Mutation":
        const mutations: ResolverMetadata | undefined = metadata.mutations.find((m) => m.methodName === fieldName);
        return mutations?.target.name;
      case "Subscription":
        const subscriptions: ResolverMetadata | undefined = metadata.subscriptions.find((m) => m.methodName === fieldName);
        return subscriptions?.target.name;
    }
    return undefined;
  }

  private static decodeAndVerifyToken = (
    token: string,
    requiredRole: string
  ): UserAuthPayload => {
    try {
      const decoded = verify(
        token,
        ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret
      ) as UserAuthPayload;

      if (decoded.tokenPermissions !== requiredRole) {
        throw new AuthenticationError("Unauthorized role");
      }
      return decoded;
    } catch (error) {
      throw new AuthenticationError("Invalid token");
    }
  };

  private static decodeToken(token: string | any): UserAuthPayload | undefined{
    if (!token) {
      return undefined
    }
    const decoded = decode(token) as UserAuthPayload;
    return decoded;
  }

  private static findUser = async (decodedToken: UserAuthPayload) => {
    return User.findOne({
      _id: decodedToken.id,
      email: decodedToken.email,
    });
  };
}



const VerifyTokenForgotPassword = AuthMiddleware.verifyToken(Role.FORGOT_PASSWORD);
const VerifyTokenAll = AuthMiddleware.verifyToken(Role.ALL);
const AuthorizationMiddleware = AuthMiddleware.accessedMethod();


export { AuthMiddleware, VerifyTokenAll, VerifyTokenForgotPassword, AuthorizationMiddleware };

