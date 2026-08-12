import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(
      `CRITICAL FATAL CONFIGURATION ERROR: Required environment variable '${key}' is missing or empty. Please check your .env file.`
    );
  }

  return value.trim();
};

const getPort = (): number => {
  const value = process.env.PORT || "5000";
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      "CRITICAL FATAL CONFIGURATION ERROR: PORT must be a valid number between 1 and 65535."
    );
  }

  return port;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: getPort(),
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};