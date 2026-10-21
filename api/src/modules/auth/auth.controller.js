import { uploadedName } from "../uploads/upload.middleware.js";
import { ROLES } from "../users/user.constants.js";
import { authenticate, registerUser } from "./auth.service.js";
import { clearAuthCookie, setAuthCookie } from "./auth.token.js";

export async function signUp(req, res) {
  const user = await registerUser(req.validated.body, {
    photo: uploadedName(req, "photo"),
    cv: uploadedName(req, "cv"),
  });

  const pendingApproval = user.role === ROLES.TEACHER;
  if (!pendingApproval) setAuthCookie(res, user.id);

  res.status(201).json({ user, pendingApproval });
}

export async function login(req, res) {
  const user = await authenticate(req.validated.body);
  setAuthCookie(res, user.id);
  res.json({ user });
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user?.isApproved ? req.user : null });
}
