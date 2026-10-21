import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { SELF_SIGNUP_ROLES, ROLES } from "../users/user.constants.js";
import * as adminService from "./admin.service.js";

const listUsersQuerySchema = z.object({
  role: z.enum(SELF_SIGNUP_ROLES).optional(),
  status: z.enum(["pending", "approved"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(ROLES.ADMIN));

adminRouter.get("/stats", async (_req, res) => {
  res.json({ stats: await adminService.stats() });
});

adminRouter.get("/users", validate(listUsersQuerySchema, "query"), async (req, res) => {
  res.json({ users: await adminService.listUsers(req.validated.query) });
});

adminRouter.post("/users/:id/approve", async (req, res) => {
  res.json({ user: await adminService.approveUser(req.params.id) });
});

adminRouter.delete("/users/:id", async (req, res) => {
  await adminService.deleteUser(req.params.id, req.user);
  res.status(204).end();
});

adminRouter.get("/users/:id/cv", async (req, res) => {
  const { file, name } = await adminService.cvPath(req.params.id);
  res.download(file, name);
});

adminRouter.get("/requests", async (_req, res) => {
  res.json({ requests: await adminService.pendingRequests() });
});
