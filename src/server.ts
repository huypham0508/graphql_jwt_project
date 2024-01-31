import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  // ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import cors from "cors";
import connectDB from "./app/types/utils/connectDB";
import { buildSchema } from "type-graphql";
import { ConfigServer } from "./app/config/config";
import { GreetingResolver, UserResolver } from "./app/resolvers/index";
import { app, httpServer } from "./app/app";

const main = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [GreetingResolver, UserResolver],
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // ApolloServerPluginLandingPageGraphQLPlayground
    ],
    context: ({ req, res }) => {
      return { req, res };
    },
  });
  app.use(cors());
  await connectDB();
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  httpServer.listen({ port: ConfigServer.PORT });
};

main().catch((error) => console.log("ERROR STARTING SERVER: ", error));

export default main();
