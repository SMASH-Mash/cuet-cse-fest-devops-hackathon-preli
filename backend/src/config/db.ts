import mongoose from "mongoose";
import { envConfig } from "./envConfig";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async () => {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;

      console.log(`Connecting to MongoDB (attempt ${attempts}/${MAX_RETRIES})...`);

      await mongoose.connect(envConfig.mongo.uri, {
        dbName: envConfig.mongo.dbName,
      });

      console.log("MongoDB connection established.");
      return;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error}`);

      if (attempts >= MAX_RETRIES) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};
