import "reflect-metadata";
import connect_database from "./app/core/services/connect_database.service";
import redis from "./app/core/services/redis_store.service";

import { app, httpServer } from "./app/app";
import { ConfigServer } from "./app/config";
import initializeModels from "./app/core/models/init_data";
import ApolloServers from "./app/graphql_app";

const main = async () => {
  try {
    console.log("🚀 Connecting to the database...");
    await connect_database();
    console.log("✅ Database connected successfully!");

    console.log("🚀 Initializing models...");
    await initializeModels();
    console.log("✅ Models initialized successfully!");

    console.log("🚀 Connecting to Redis...");
    await redis.RedisStorage.getInstance().connect();
    console.log("✅ Redis connected successfully!");

    console.log("🚀 Initializing Apollo Servers...");
    const apolloServers = await ApolloServers();

    for (const [index, apolloServer] of apolloServers.entries()) {
      await apolloServer.start();
      const versionPath = `/graphql/v${index + 1}`;
      apolloServer.applyMiddleware({ app, path: versionPath });
    }

    httpServer.listen({ port: ConfigServer.PORT }, async () => {
      apolloServers.forEach(async (_, index) => {
        const versionPath = `/graphql/v${index + 1}`;
        console.group();
        console.log(
          `Graphql ready at http://localhost:${ConfigServer.PORT}${versionPath}`
        );
        console.log(
          `Docs ready at http://localhost:${ConfigServer.PORT}/api/v1`
        );
        console.log(`Docs ready at http://localhost:${ConfigServer.PORT}/docs`);
        console.groupEnd();
      });
    });
  } catch (error) {
    console.error("❌ ERROR STARTING SERVER:", error.message);
    console.error(error.stack);
    process.exit(1); // Dừng server nếu lỗi nghiêm trọng
  }
};

main().catch((error) => console.log("ERROR STARTING SERVER: ", error));
