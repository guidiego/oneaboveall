import { createConnection, Connection } from "typeorm";
import * as Config from '../../config';

import * as models from '../../entities';

export const ConnectDB = async (config = Config): Promise<Connection> => 
  await createConnection({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: Object.values(models)
  });
