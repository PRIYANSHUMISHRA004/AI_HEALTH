import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env";

export const connectToDatabase = async (): Promise<void> => {
  const startInMemoryMongo = async (): Promise<void> => {
    const mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    console.log(`[db] Falling back to in-memory MongoDB at ${inMemoryUri}`);
    await mongoose.connect(inMemoryUri);
  };

  try {
    // Automatically use memory server if we don't have a real local db
    if (
      env.mongoUri.includes("localhost:27017/ai_health") ||
      env.mongoUri.includes("dummy")
    ) {
      await startInMemoryMongo();
    } else {
      await mongoose.connect(env.mongoUri);
    }

    console.log("MongoDB connected");
  } catch (error) {
    if (env.nodeEnv !== "production") {
      console.warn(
        "[db] Primary MongoDB connection failed in non-production mode, trying in-memory fallback."
      );
      try {
        await startInMemoryMongo();
        console.log("MongoDB connected");
        return;
      } catch (fallbackError) {
        console.error("MongoDB in-memory fallback failed", fallbackError);
        throw fallbackError;
      }
    }

    console.error("MongoDB connection failed", error);
    throw error;
  }
};
