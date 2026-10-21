import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.js"],
    setupFiles: ["./__tests__/setup.js"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
      AUTH_RATE_LIMIT_MAX: "1000",
      UPLOADS_DIR: mkdtempSync(path.join(tmpdir(), "education-test-uploads-")),
    },
  },
});
