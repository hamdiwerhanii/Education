import { randomBytes } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.JWT_SECRET ??= randomBytes(32).toString("hex");
process.env.UPLOADS_DIR ??= mkdtempSync(path.join(tmpdir(), "education-demo-uploads-"));

const { MongoMemoryServer } = await import("mongodb-memory-server");
const { DEMO_ACCOUNTS, seedDatabase } = await import("./scripts/seedData.js");
const { startServer } = await import("./startServer.js");

const memoryServer = await MongoMemoryServer.create();

await startServer({
  mongoUri: memoryServer.getUri("education-demo"),
  onShutdown: () => memoryServer.stop(),
});
await seedDatabase();

console.log("Demo mode: in-memory database seeded. Data is lost when the server stops.");
console.table(DEMO_ACCOUNTS.map(({ role, telephone, password, note }) => ({ role, telephone, password, note })));
