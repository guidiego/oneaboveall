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

import { main } from '~/index';

import winston from 'winston';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';

import getLogConfig from '~/util/log';
import { ConnectDB } from '~/util/storage/typeorm';

describe('index', () => {
  const fakeServer = { listen: jest.fn() };
  const configReturn = 'foo';
  const fakeUrl = 'bar';
  const fakeSchema = 'fakeSchema';
  const fakeConn = { foo: 'bar' };
  const fakeLog = 'fakeLog';
  const debug = 0;
  const env = 'test';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call main method without production tag', async () => {
    fakeServer.listen.mockResolvedValue(fakeUrl);
    (getLogConfig as jest.Mock).mockReturnValue(configReturn);
    (buildSchema as jest.Mock).mockResolvedValue(fakeSchema);
    (winston.createLogger as jest.Mock).mockReturnValue(fakeLog);
    (ConnectDB as jest.Mock).mockResolvedValue(fakeConn);
    (ApolloServer as jest.Mock).mockImplementation(() => fakeServer);

    await main({ env, debug });

    expect(ConnectDB).toHaveBeenCalled();
    expect(buildSchema).toHaveBeenCalled();
    expect(getLogConfig).toHaveBeenCalledWith(env, debug)
    expect(winston.createLogger).toHaveBeenCalledWith(configReturn);
    expect(ApolloServer).toHaveBeenCalledWith({ schema: fakeSchema, context: { logger: fakeLog, connection: fakeConn }});
    expect(fakeServer.listen).toHaveBeenCalledTimes(1);
  });
})
