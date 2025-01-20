"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const app_1 = require("./app");
const index_1 = __importDefault(require("./v1/resolvers/index"));
const apolloServers = async () => {
    const apolloServerV1 = new apollo_server_express_1.ApolloServer({
        schema: await index_1.default,
        plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer: app_1.httpServer })],
        context: ({ req, res }) => {
            return { req, res, version: "v1" };
        },
    });
    return [apolloServerV1];
};
exports.default = apolloServers;
//# sourceMappingURL=graphql_app.js.map