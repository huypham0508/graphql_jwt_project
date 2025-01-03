import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  // ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import connectDBService from "./app/services/ConnectDatabaseService";
import {initRedis} from "./app/services/ConnectRedisService";
// import { ServerEvents } from "./app/services/ChatEventsService";
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

  await connectDBService();
  await initRedis();
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
