import { startServer } from "./startServer.js";

try {
  await startServer();
} catch (error) {
  console.error(`Could not start the API: ${error.message}`);
  console.error("Is MongoDB running? Tip: use `npm run dev:demo` to start with an in-memory database.");
  process.exit(1);
}
