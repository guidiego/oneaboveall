import "reflect-metadata";

import winston from 'winston';
import { buildSchema } from 'type-graphql';

import resolvers from './resolvers';
import getLogConfig from './util/log';
import { ENV, DEBUG, APOLLO_SUFFIX } from './config';
import { ConnectDB } from './util/storage/typeorm';

type MainOpts = {
  env: typeof ENV;
  debug: typeof DEBUG;
  logListen?: boolean;
};

const APOLLO_IMPORT_PATH = 'apollo-server' + APOLLO_SUFFIX;

// eslint-disable-next-line
export const createApolloServer = async ({ env, debug }: MainOpts): Promise<any> => {
  const apollo = await import(APOLLO_IMPORT_PATH);
  const connection = await ConnectDB();
  const schema = await buildSchema({ resolvers })
  const logger = winston.createLogger(getLogConfig(env, debug));
  return new apollo.ApolloServer({ schema, context: { logger, connection } });
};

// eslint-disable-next-line
export const handler = async () => {
  const apollo = await createApolloServer({ env: ENV, debug: DEBUG });
  return apollo.createHandler();
};
