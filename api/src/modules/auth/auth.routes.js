import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { optionalAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { removeUploadedFiles, uploadProfileFiles } from "../uploads/upload.middleware.js";
import { login, logout, me, signUp } from "./auth.controller.js";
import { loginSchema, signUpSchema } from "./auth.schemas.js";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const createLimiter = (options = {}) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: { message: "Too many attempts, please try again in 15 minutes" } },
    ...options,
  });

const loginLimiter = createLimiter({ skipSuccessfulRequests: true });
const signUpLimiter = createLimiter();

export const authRouter = Router();

authRouter.post("/signup", signUpLimiter, uploadProfileFiles, validate(signUpSchema), signUp);
authRouter.post("/login", loginLimiter, validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/me", optionalAuth, me);

authRouter.use((error, req, _res, next) => {
  removeUploadedFiles(req.files).finally(() => next(error));
});
