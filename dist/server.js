"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const connect_database_service_1 = __importDefault(require("./app/core/services/connect_database.service"));
const redis_store_service_1 = __importDefault(require("./app/core/services/redis_store.service"));
const app_1 = require("./app/app");
const config_1 = require("./app/config");
const init_data_1 = __importDefault(require("./app/core/models/init_data"));
const graphql_app_1 = __importDefault(require("./app/graphql_app"));
const main = async () => {
    await (0, connect_database_service_1.default)();
    await (0, init_data_1.default)();
    await redis_store_service_1.default.RedisStorage.getInstance().connect();
    const apolloServers = await (0, graphql_app_1.default)();
    for (const [index, apolloServer] of apolloServers.entries()) {
        await apolloServer.start();
        const versionPath = `/graphql/v${index + 1}`;
        apolloServer.applyMiddleware({ app: app_1.app, path: versionPath });
    }
    app_1.httpServer.listen({ port: config_1.ConfigServer.PORT }, async () => {
        apolloServers.forEach(async (_, index) => {
            const versionPath = `/graphql/v${index + 1}`;
            console.log(`Server ready at http://localhost:${config_1.ConfigServer.PORT}${versionPath}`);
        });
    });
};
main().catch((error) => console.log("ERROR STARTING SERVER: ", error));
//# sourceMappingURL=server.js.map