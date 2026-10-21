import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";

const DEFAULT_ROOT = fileURLToPath(new URL("../../../uploads", import.meta.url));

export const UPLOADS_ROOT = path.resolve(env.UPLOADS_DIR ?? DEFAULT_ROOT);
export const PHOTOS_DIR = path.join(UPLOADS_ROOT, "photos");
export const CVS_DIR = path.join(UPLOADS_ROOT, "cvs");

for (const dir of [PHOTOS_DIR, CVS_DIR]) mkdirSync(dir, { recursive: true });
