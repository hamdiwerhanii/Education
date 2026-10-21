import { randomUUID } from "node:crypto";
import { open, unlink } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { badRequest } from "../../shared/utils/AppError.js";
import { CVS_DIR, PHOTOS_DIR } from "./upload.paths.js";

const MB = 1024 * 1024;

const FILE_RULES = {
  photo: {
    dir: PHOTOS_DIR,
    maxBytes: 2 * MB,
    types: {
      "image/png": { ext: "png", magic: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
      "image/jpeg": { ext: "jpg", magic: (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
      "image/webp": {
        ext: "webp",
        magic: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
      },
    },
    label: "a PNG, JPG or WEBP image of at most 2 MB",
  },
  cv: {
    dir: CVS_DIR,
    maxBytes: 5 * MB,
    types: {
      "application/pdf": { ext: "pdf", magic: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-" },
    },
    label: "a PDF of at most 5 MB",
  },
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, FILE_RULES[file.fieldname].dir),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}.${FILE_RULES[file.fieldname].types[file.mimetype].ext}`),
});

const fileFilter = (_req, file, cb) => {
  const rule = FILE_RULES[file.fieldname];
  if (!rule) return cb(badRequest(`Unexpected file field "${file.fieldname}"`));
  if (!rule.types[file.mimetype]) {
    return cb(badRequest(`The ${file.fieldname} must be ${rule.label}`, { [file.fieldname]: [`Must be ${rule.label}`] }));
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_RULES.cv.maxBytes, files: 2 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]);

async function readHead(filePath) {
  const handle = await open(filePath, "r");
  try {
    const buffer = Buffer.alloc(12);
    await handle.read(buffer, 0, 12, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

export const removeUploadedFiles = (files = {}) =>
  Promise.all(Object.values(files).flat().map((file) => unlink(file.path).catch(() => undefined)));

async function verifyContent(files = {}) {
  for (const file of Object.values(files).flat()) {
    const rule = FILE_RULES[file.fieldname];
    if (file.size > rule.maxBytes) {
      throw badRequest(`The ${file.fieldname} must be ${rule.label}`, { [file.fieldname]: [`Must be ${rule.label}`] });
    }
    const head = await readHead(file.path);
    if (!rule.types[file.mimetype].magic(head)) {
      throw badRequest(`The ${file.fieldname} file content does not match its type`, {
        [file.fieldname]: [`Must be ${rule.label}`],
      });
    }
  }
}

export function uploadProfileFiles(req, res, next) {
  multerUpload(req, res, async (error) => {
    if (error) {
      await removeUploadedFiles(req.files);
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        return next(badRequest("A file is too large", { [error.field]: ["File is too large"] }));
      }
      return next(error);
    }
    try {
      await verifyContent(req.files);
      next();
    } catch (verifyError) {
      await removeUploadedFiles(req.files);
      next(verifyError);
    }
  });
}

export const uploadedName = (req, field) => (req.files?.[field]?.[0] ? path.basename(req.files[field][0].path) : "");
