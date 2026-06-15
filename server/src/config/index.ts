/* eslint-disable no-undef */
import dotenv from "dotenv";
import path from "path";
const environment = process.env.NODE_ENV || "development";

const envFilePath = path.join(process.cwd(), environment === "development" ? "development.env" : "production.env");
const result = dotenv.config({ path: envFilePath });

if (result.error) {
  console.error(`Failed to load environment file at ${envFilePath}:`, result.error);
} else {
  console.log(`Environment file loaded successfully from ${envFilePath}`);
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
  JWT: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE,
  },
  APP_VARIABLES: {
    SCHEDULE_MODE: process.env.SCHEDULE_MODE,
  },
};
