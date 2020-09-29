jest.mock('../../../../src/entities', () => ({ fakeEntities: 'Alo' }));
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    createConnection: jest.fn(),
  }
});

import * as Config from '~/config';
import { ConnectDB } from '~/util/storage/typeorm';
import { createConnection } from "typeorm";
import * as entities from '~/entities';

describe('util/storage/typeorm', () => {
  const fakeReturn = 'foo';
  const config = {
    DB_TYPE: 'DB_TYPE',
    DB_HOST: 'DB_HOST',
    DB_PORT: 'DB_PORT',
    DB_USER: 'DB_USER',
    DB_PASSWORD: 'DB_PASSWORD',
    DB_NAME: 'DB_NAME',
    DEBUG: 3,
  };

  const createMatcher = (logging: string | boolean) => ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: Object.values(entities),
    logging
  });

  beforeEach(() => {
    (createConnection as jest.Mock).mockResolvedValue(fakeReturn);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call with loggin all', async () => {
    const con = await ConnectDB(config as unknown as typeof Config);

    expect(con).toBe(fakeReturn);
    expect(createConnection).toHaveBeenCalledWith(
      createMatcher('all')
    );
  });

  it('should call with loggin false', async () => {
    config.DEBUG = 1;
    const con = await ConnectDB(config as unknown as typeof Config);

    expect(con).toBe(fakeReturn);
    expect(createConnection).toHaveBeenCalledWith(
      createMatcher(false)
    );
  });

  it('should call with default config', async () => {
    const con = await ConnectDB();

    expect(con).toBe(fakeReturn);
    expect(createConnection).toHaveBeenCalledWith({
      type: Config.DB_TYPE,
      host: Config.DB_HOST,
      port: Config.DB_PORT,
      username: Config.DB_USER,
      password: Config.DB_PASSWORD,
      database: Config.DB_NAME,
      entities: Object.values(entities),
      logging: Config.DEBUG >= 3 ? "all" : false
    });
  });
});
