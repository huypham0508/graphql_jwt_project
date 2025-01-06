import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  // ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import RedisClient from "./app/services/redis_store.service";
// import { ServerEvents } from "./app/services/ChatEventsService";
import connectDBService from "./app/services/connect_database.service";
import { buildSchema } from "type-graphql";
import { ConfigServer } from "./app/config/config";
import {
  GreetingResolver,
  AuthResolver,
  ReactionResolver,
  RelationshipResolver,
  PostResolver,
  ChatResolver,
} from "./app/resolvers/index";
import { app, httpServer } from "./app/app";

// const chatEventListener = ServerEvents.getInstance();

const main = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [
        GreetingResolver,
        AuthResolver,
        PostResolver,
        ReactionResolver,
        RelationshipResolver,
        ChatResolver,
      ],
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // ApolloServerPluginLandingPageGraphQLPlayground
    ],
    context: ({ req, res }) => {
      return { req, res };
    },
  });

  const redisClient = RedisClient.getInstance();
  await connectDBService();
  redisClient.connect();
  await apolloServer.start();

  // chatEventListener.initialize()
  apolloServer.applyMiddleware({ app });
  httpServer.listen({ port: ConfigServer.PORT }, async () => {
    console.log(
      `Server ready at http://localhost:${ConfigServer.PORT}${apolloServer.graphqlPath}`
    );
  });
};

main().catch((error) => console.log("ERROR STARTING SERVER: ", error));
