import 'reflect-metadata'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import {
    ApolloServerPluginDrainHttpServer,
    // ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import cors from 'cors';
import connectDB from './utils/connectDB';
import { createServer } from 'http';
import { buildSchema } from 'type-graphql';
import { ConfigServer } from './config/config';
import { GreetingResolver, UserResolver } from './resolvers/index';

const app = express()
const httpServer = createServer(app);


const main = async () => {
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [GreetingResolver, UserResolver]
        }),
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            // ApolloServerPluginLandingPageGraphQLPlayground
        ],
        context: ({ req, res }) => {
            return ({ req, res })
        }
    });
    await app.use(cors());
    await connectDB();
    await apolloServer.start();
    await apolloServer.applyMiddleware({ app });
    httpServer.listen({ port: ConfigServer.PORT }, async () => {
        console.log(`Server ready at http://localhost:${ConfigServer.PORT}${apolloServer.graphqlPath}`);
    });
};

main().catch(error => console.log("ERROR STARTING SERVER: ", error));

//1h42p