"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicFunctions = void 0;
const type_graphql_1 = require("type-graphql");
const emit_events_resolver_1 = require("./emit_events.resolver");
const auth_resolver_1 = require("./auth.resolver");
const reaction_resolver_1 = require("./reaction.resolver");
const relationship_resolver_1 = require("./relationship.resolver");
const chat_resolver_1 = require("./chat.resolver");
const post_resolver_1 = require("./post.resolver");
const system_resolver_1 = require("./system.resolver");
const auth_1 = require("../../core/middleware/auth");
const rate_limited_1 = require("../../core/middleware/rate_limited");
exports.publicFunctions = ["AuthResolver"];
exports.default = (0, type_graphql_1.buildSchema)({
    validate: false,
    resolvers: [
        system_resolver_1.SystemResolver,
        emit_events_resolver_1.EmitEventResolver,
        auth_resolver_1.AuthResolver,
        post_resolver_1.PostResolver,
        reaction_resolver_1.ReactionResolver,
        relationship_resolver_1.RelationshipResolver,
        chat_resolver_1.ChatResolver,
    ],
    globalMiddlewares: [auth_1.AuthorizationMiddleware, rate_limited_1.RateLimitMiddleware],
});
//# sourceMappingURL=index.js.map