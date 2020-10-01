jest.mock('winston');

jest.mock('apollo-server', () => ({ ApolloServer: jest.fn() }));
jest.mock('../../src/util/log');
jest.mock('../../src/resolvers');

jest.mock('type-graphql', () =>  {
  const tgql = jest.requireActual("type-graphql");
  return { ...tgql, buildSchema: jest.fn() };
});

jest.mock('../../src/util/storage/typeorm', () => ({
  ConnectDB: jest.fn()
}));

import { createApolloServer, handler } from '~/apollo';

import winston from 'winston';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

import getLogConfig from '~/util/log';
import { ConnectDB } from '~/util/storage/typeorm';

describe('index', () => {
  const fakeServer = { listen: jest.fn() };
  const configReturn = 'foo';
  const fakeResponse = 'bar';
  const fakeSchema = 'fakeSchema';
  const fakeConn = { foo: 'bar' };
  const fakeLog = 'fakeLog';
  const debug = 0;
  const env = 'test';

  beforeEach(() => {
    (getLogConfig as jest.Mock).mockReturnValue(configReturn);
    (buildSchema as jest.Mock).mockResolvedValue(fakeSchema);
    (winston.createLogger as jest.Mock).mockReturnValue(fakeLog);
    (ConnectDB as jest.Mock).mockResolvedValue(fakeConn);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call main method without production tag', async () => {
    (ApolloServer as jest.Mock).mockImplementation(() => fakeServer);
    const server = await createApolloServer({ env, debug });

    expect(ConnectDB).toHaveBeenCalled();
    expect(buildSchema).toHaveBeenCalled();
    expect(getLogConfig).toHaveBeenCalledWith(env, debug)
    expect(winston.createLogger).toHaveBeenCalledWith(configReturn);
    expect(ApolloServer).toHaveBeenCalledWith({ schema: fakeSchema, context: { logger: fakeLog, connection: fakeConn }});
    expect(server).toEqual(fakeServer);
  });

  it('.handler() should work correctly', async () => {
    const fakeLambda = { createHandler: jest.fn().mockReturnValue(fakeResponse) };

    (ApolloServer as jest.Mock).mockImplementation(() => fakeLambda);
    const handlerResponse = await handler();

    expect(ConnectDB).toHaveBeenCalled();
    expect(buildSchema).toHaveBeenCalled();
    expect(getLogConfig).toHaveBeenCalledWith(env, debug)
    expect(winston.createLogger).toHaveBeenCalledWith(configReturn);
    expect(fakeLambda.createHandler).toHaveBeenCalledTimes(1);
    expect(ApolloServer).toHaveBeenCalledWith({ schema: fakeSchema, context: { logger: fakeLog, connection: fakeConn }});
    expect(handlerResponse).toEqual(fakeResponse);
  })
})
