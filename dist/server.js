"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const cors_1 = __importDefault(require("cors"));
const connectDB_1 = __importDefault(require("./app/utils/connectDB"));
const type_graphql_1 = require("type-graphql");
const config_1 = require("./app/config/config");
const index_1 = require("./app/resolvers/index");
const app_1 = require("./app/app");
const main = async () => {
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            validate: false,
            resolvers: [index_1.GreetingResolver, index_1.UserResolver]
        }),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer: app_1.httpServer }),
        ],
        context: ({ req, res }) => {
            return ({ req, res });
        }
    });
    app_1.app.use((0, cors_1.default)());
    await (0, connectDB_1.default)();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: app_1.app });
    app_1.httpServer.listen({ port: config_1.ConfigServer.PORT }, async () => {
        console.log(`Server ready at http://localhost:${config_1.ConfigServer.PORT}${apolloServer.graphqlPath}`);
    });
};
main().catch(error => console.log("ERROR STARTING SERVER: ", error));
//# sourceMappingURL=server.js.map