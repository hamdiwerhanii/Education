import { env, isProduction } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../db/connect.js";
import { DEMO_ACCOUNTS, seedDatabase } from "./seedData.js";

if (isProduction) {
  console.error("Refusing to seed a production database.");
  process.exit(1);
}

await connectDatabase(env.MONGODB_URI);
const result = await seedDatabase();
await disconnectDatabase();

console.log(`Seeded ${result.users} users and ${result.courses} courses into ${env.MONGODB_URI}`);
console.table(DEMO_ACCOUNTS);
