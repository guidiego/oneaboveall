// Non Required Prop
const DB_TYPE = process.env.DB_TYPE || 'postgres';
const DB_HOST = process.env.DB_HOST || '0.0.0.0';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

module.exports = {
   "type": DB_TYPE,
   "host": DB_HOST,
   "port": DB_PORT,
   "username": DB_USER,
   "password": DB_PASSWORD,
   "database": DB_NAME,
   "synchronize": true,
   "logging": false,
   "entities": [
      "dist/src/entity/**/*.ts"
   ],
   "migrations": [
      "dist/src/migration/**/*.ts"
   ],
   "subscribers": [
      "dist/src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "dist/src/entity",
      "migrationsDir": "dist/src/migration",
      "subscribersDir": "dist/src/subscriber"
   }
}
