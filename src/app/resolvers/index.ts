import { buildSchema } from "type-graphql";

import { GreetingResolver } from "./greeting.resolver";
import { AuthResolver } from "./auth.resolver";
import { ReactionResolver } from "./reaction.resolver";
import { RelationshipResolver } from "./relationship.resolver";
import { ChatResolver } from "./chat.resolver";
import { PostResolver } from "./post.resolver";
import {SystemResolver} from "./system.resolver";
import { AuthorizationMiddleware } from "../middleware/auth";

export const publicFunctions = ["AuthResolver"];

export default buildSchema({
  validate: false,
  resolvers: [
    SystemResolver,
    GreetingResolver,
    AuthResolver,
    PostResolver,
    ReactionResolver,
    RelationshipResolver,
    ChatResolver,
  ],
  globalMiddlewares: [AuthorizationMiddleware]
});