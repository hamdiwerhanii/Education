import { isProduction } from "../../config/env.js";
import { AppError } from "../utils/AppError.js";

const DUPLICATE_KEY_CODE = 11000;

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  if (err?.code === DUPLICATE_KEY_CODE) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    const message = `That ${field} is already in use`;
    return res.status(409).json({ error: { message, details: { [field]: [message] } } });
  }

  if (err?.name === "ValidationError") {
    const details = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, [e.message]]));
    return res.status(400).json({ error: { message: "Please check the highlighted fields", details } });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { message: "Request body must be valid JSON" } });
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: { message: "Request body is too large" } });
  }

  console.error(err);
  res.status(500).json({
    error: { message: isProduction ? "Something went wrong" : String(err?.message ?? err) },
  });
}
