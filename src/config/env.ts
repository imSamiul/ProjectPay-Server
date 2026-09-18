import path from "path";
import dotenv from "dotenv";

/** Loads project-root `.env` (skills: dotenv.config). */
export function loadEnv(): void {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Typed app config (reads process.env after loadEnv). */
export function getConfig() {
  return {
    port: Number(getEnv("PORT", "4000")),
    env: process.env.NODE_ENV ?? "development",
    mongodbUrl: getEnv("MONGODB_URL"),
    jwtToken: getEnv("JWT_TOKEN"),
    clientOrigin: getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
    logLevel: getEnv("LOG_LEVEL", "info"),
  };
}
