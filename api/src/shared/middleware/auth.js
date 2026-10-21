import { AUTH_COOKIE, verifyToken } from "../../modules/auth/auth.token.js";
import { User } from "../../modules/users/user.model.js";
import { forbidden, unauthorized } from "../utils/AppError.js";

async function loadUser(req) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await loadUser(req);
  next();
}

export async function requireAuth(req, _res, next) {
  const user = await loadUser(req);
  if (!user) return next(unauthorized());
  if (!user.isApproved) return next(forbidden("Your account is waiting for admin approval"));

  req.user = user;
  next();
}

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) return next(forbidden());
    next();
  };
