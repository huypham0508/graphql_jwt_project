import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";

import { httpServer } from "./app";
import buildSchema from "./v1/resolvers/index";

const apolloServers = async (): Promise<ApolloServer[]> => {
  const apolloServerV1 = new ApolloServer({
    schema: await buildSchema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req, res }) => {
      return { req, res, version: "v1" };
    },
  });


  return [apolloServerV1];
};

export default apolloServers;
