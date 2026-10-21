import jwt from "jsonwebtoken";
import { env, isProduction } from "../../config/env.js";

export const AUTH_COOKIE = "token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const setAuthCookie = (res, userId) =>
  res.cookie(AUTH_COOKIE, signToken(userId), { ...cookieOptions, maxAge: SEVEN_DAYS_MS });

export const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE, cookieOptions);
