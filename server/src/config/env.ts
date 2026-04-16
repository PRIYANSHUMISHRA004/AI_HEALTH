import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

const getRequiredEnv = (key: string, fallback?: string): string => {
  const value = process.env[key]?.trim() || fallback?.trim();
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}. Add it to server/.env before starting the server.`);
  }
  return value;
};

const parsePort = (value: string | undefined): number => {
  if (!value) return 5000;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("[env] Invalid PORT. Expected an integer between 1 and 65535.");
  }
  return parsed;
};

const rawNodeEnv = (process.env.NODE_ENV?.trim() || "development") as NodeEnv;
const nodeEnv: NodeEnv = ["development", "production", "test"].includes(rawNodeEnv)
  ? rawNodeEnv
  : "development";

export interface EnvConfig {
  port: number;
  nodeEnv: NodeEnv;
  mongoUri: string;
  jwtSecret: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  hfApiKey: string;
  hfEmbeddingModel: string;
  openRouterApiKey: string;
  openRouterModel: string;
}

export const env: EnvConfig = {
  port: parsePort(process.env.PORT),
  nodeEnv,
  mongoUri: getRequiredEnv("MONGO_URI"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  cloudinaryCloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  hfApiKey: getRequiredEnv("HF_API_KEY"),
  hfEmbeddingModel: getRequiredEnv("HF_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
  openRouterApiKey: getRequiredEnv("OPENROUTER_API_KEY"),
  openRouterModel: getRequiredEnv("OPENROUTER_MODEL", "openrouter/free"),
};
