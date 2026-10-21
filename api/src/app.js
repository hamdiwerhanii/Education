import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { isProduction } from "./config/env.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { courseRouter } from "./modules/courses/course.routes.js";
import { meRouter } from "./modules/me/me.routes.js";
import { teacherRouter } from "./modules/teachers/teacher.routes.js";
import { PHOTOS_DIR } from "./modules/uploads/upload.paths.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";

const CLIENT_DIST = fileURLToPath(new URL("../../client/dist/client/browser", import.meta.url));

export function createApp() {
  const app = express();

  if (isProduction) app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "img-src": ["'self'", "data:", "blob:"],
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        },
      },
      strictTransportSecurity: isProduction,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/uploads/photos", express.static(PHOTOS_DIR, { maxAge: "7d", index: false, dotfiles: "deny" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/courses", courseRouter);
  app.use("/api/teachers", teacherRouter);
  app.use("/api/me", meRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", notFoundHandler);

  if (isProduction && existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { index: false, maxAge: "1y", immutable: true }));
    app.get("/{*path}", (_req, res) => res.sendFile("index.html", { root: CLIENT_DIST, maxAge: 0 }));
  }

  app.use(errorHandler);
  return app;
}
