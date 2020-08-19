// Non Required Prop
export const DB_TYPE: ConnectionType = process.env.DB_TYPE as ConnectionType || 'postgres';
export const DB_HOST = process.env.DB_HOST || '0.0.0.0';
export const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
export const ENV = (process.env.NODE_ENV || 'development') as AvailableEnvs;
export const DEBUG = parseInt(process.env.DEBUG || '0', 10);

// Required Configs
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;
