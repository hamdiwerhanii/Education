import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/education"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.url().default("http://localhost:4200"),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  UPLOADS_DIR: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment variables (see api/.env.example):\n${problems.join("\n")}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
