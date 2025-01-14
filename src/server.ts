import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  // ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";

import buildSchema from "./app/resolvers/index"

import redis from "./app/services/redis_store.service";
import connect_database from "./app/services/connect_database.service";

import { ConfigServer } from "./app/config/config";
import { app, httpServer } from "./app/app";

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
