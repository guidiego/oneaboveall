require('dotenv').config();
import "reflect-metadata";

import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

import { ConnectDB } from './util/storage/typeorm';
import resolvers from './resolvers';

const main = async () => {
  const x = await ConnectDB();
  const schema = await buildSchema({ resolvers })
  const server = new ApolloServer({ schema });

  await x.synchronize()
  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

main();
