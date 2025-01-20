import { buildSchema } from "type-graphql";

import { EmitEventResolver } from "./emit_events.resolver";
import { AuthResolver } from "./auth.resolver";
import { ReactionResolver } from "./reaction.resolver";
import { RelationshipResolver } from "./relationship.resolver";
import { ChatResolver } from "./chat.resolver";
import { PostResolver } from "./post.resolver";
import { SystemResolver } from "./system.resolver";
import { AuthorizationMiddleware } from "../../core/middleware/auth";
import { RateLimitMiddleware } from "../../core/middleware/rate_limited";

export const publicFunctions = ["AuthResolver"];

export default buildSchema({
  validate: false,
  resolvers: [
    SystemResolver,
    EmitEventResolver,
    AuthResolver,
    PostResolver,
    ReactionResolver,
    RelationshipResolver,
    ChatResolver,
  ],
  globalMiddlewares: [AuthorizationMiddleware, RateLimitMiddleware],
});
