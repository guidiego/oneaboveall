import winston from "winston/lib/winston/config";

declare type AvailableEnvs = 'production' | 'development' | 'test';

declare type AppContext = {
  logger: winston.Logger
}
