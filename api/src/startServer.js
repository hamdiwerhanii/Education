import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./db/connect.js";

export async function startServer({ mongoUri = env.MONGODB_URI, onShutdown } = {}) {
  await connectDatabase(mongoUri);

  const server = createApp().listen(env.PORT, () => {
    console.log(`API ready on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDatabase();
    await onShutdown?.();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  return server;
}
