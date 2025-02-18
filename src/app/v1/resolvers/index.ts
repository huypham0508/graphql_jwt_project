import { buildSchema } from "type-graphql";

import { AuthorizationMiddleware } from "../../core/middleware/auth";
import { AuthResolver } from "./auth.resolver";
import { ChatResolver } from "./chat.resolver";
import { EmitEventResolver } from "./emit_events.resolver";
import { PostResolver } from "./post.resolver";
import { ReactionResolver } from "./reaction.resolver";
import { RelationshipResolver } from "./relationship.resolver";
import { SystemResolver } from "./system.resolver";

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
  globalMiddlewares: [AuthorizationMiddleware],
});
