/*  eslint-disable @typescript-eslint/no-explicit-any */
declare type AvailableEnvs = 'production' | 'development' | 'test';
declare type Class = { new(...args: any[]): any; };
declare type AppContext = { logger: winston.Logger };
/* eslint-enable @typescript-eslint/no-explicit-any */
