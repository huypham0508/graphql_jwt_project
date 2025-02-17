import "reflect-metadata";
import connect_database from "./app/core/services/connect_database.service";
import redis from "./app/core/services/redis_store.service";

import { app, httpServer } from "./app/app";
import { ConfigServer } from "./app/config";
import initializeModels from "./app/core/models/init_data";
import ApolloServers from "./app/graphql_app";

const main = async () => {
  await connect_database();
  await initializeModels();
  await redis.RedisStorage.getInstance().connect();

  const apolloServers = await ApolloServers();

  for (const [index, apolloServer] of apolloServers.entries()) {
    await apolloServer.start();
    const versionPath = `/graphql/v${index + 1}`;
    apolloServer.applyMiddleware({ app, path: versionPath });
  }

  httpServer.listen({ port: ConfigServer.PORT }, async () => {
    apolloServers.forEach(async (_, index) => {
      const versionPath = `/graphql/v${index + 1}`;
      console.log(
        `Server ready at http://localhost:${ConfigServer.PORT}${versionPath}`
      );
    });
  });
};

main().catch((error) => console.log("ERROR STARTING SERVER: ", error));
