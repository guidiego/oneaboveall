import "reflect-metadata";

import winston from 'winston';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

import resolvers from './resolvers';
import getLogConfig from './util/log';
import { ENV, DEBUG } from './config';
import { ConnectDB } from './util/storage/typeorm';

type MainOpts = {
  env: typeof ENV;
  debug: typeof DEBUG;
  logListen?: boolean;
};

export const main = async ({ env, debug }: MainOpts): Promise<void> => {
  const connection = await ConnectDB();
  const schema = await buildSchema({ resolvers })
  const logger = winston.createLogger(getLogConfig(env, debug));
  const server = new ApolloServer({ schema, context: { logger, connection } });

  return server.listen().then(({ url }) => {
    /* istanbul ignore next */
    if (env === 'development') {
      console.log(`🚀 Server ready at ${url}`);
    }
  });
};

// @TODO: if require.main
/* istanbul ignore next */
if (ENV !== 'test') {
  main({ env: ENV, debug: DEBUG });
}
