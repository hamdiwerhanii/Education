import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";
import { connectDatabase, disconnectDatabase } from "../src/db/connect.js";

let memoryServer;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  await connectDatabase(memoryServer.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectDatabase();
  await memoryServer?.stop();
});
