// Non Required Prop
export const DB_TYPE: ConnectionType = process.env.DB_TYPE as ConnectionType || 'postgres';
export const DB_HOST = process.env.DB_HOST || '0.0.0.0';
export const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEV = !IS_PROD && !IS_TEST;

// Required Configs
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;
