import "reflect-metadata";

import winston from 'winston';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

import resolvers from '~/resolvers';
import getLogConfig from './util/log';
import { ENV, DEBUG } from './config';
import { ConnectDB } from './util/storage/typeorm';

const main = async () => {
  const connection = await ConnectDB();
  const schema = await buildSchema({ resolvers })
  const logger = winston.createLogger(getLogConfig(ENV, DEBUG));
  const server = new ApolloServer({ schema, context: { logger } });

  if (ENV !== 'production') {
    await connection.synchronize()
  }

  server.listen().then(({ url }: { url: string }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
}

if (require.main === module) {
  main();
}
