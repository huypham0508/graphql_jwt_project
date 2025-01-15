import {
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";

import buildSchema from "./app/resolvers/index";

import connect_database from "./app/services/connect_database.service";
import redis from "./app/services/redis_store.service";

import { app, httpServer } from "./app/app";
import { ConfigServer } from "./app/config/config";
import initializeModels from "./app/models/init_data";

const main = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // ApolloServerPluginLandingPageGraphQLPlayground
    ],
    context: ({ req, res }) => {
      return { req, res };
    },
  });

  await connect_database();
  await initializeModels();
  await redis.RedisStorage.getInstance().connect();

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  httpServer.listen({ port: ConfigServer.PORT }, async () => {
    console.log(
      `Server ready at http://localhost:${ConfigServer.PORT}${apolloServer.graphqlPath}`
    );
  });
};

main().catch((error) => console.log("ERROR STARTING SERVER: ", error));
