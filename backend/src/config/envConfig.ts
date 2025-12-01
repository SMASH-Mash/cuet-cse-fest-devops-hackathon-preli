import dotenv from "dotenv";

// Load .env from project root
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required but missing.`);
  }
  return value;
}

export const envConfig = {
  port: Number(process.env.BACKEND_PORT || 3847),

  mongo: {
    uri: requireEnv("MONGO_URI"),       // must not be empty
    dbName: requireEnv("MONGO_DATABASE"), // required for mongoose
  },
};
