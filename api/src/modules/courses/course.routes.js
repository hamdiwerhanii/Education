import { Router } from "express";
import { optionalAuth, requireAuth, requireRole } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { ROLES } from "../users/user.constants.js";
import * as controller from "./course.controller.js";
import { courseSchema, gradeSchema, listCoursesQuerySchema, updateCourseSchema } from "./course.schemas.js";

const managers = [requireAuth, requireRole(ROLES.TEACHER, ROLES.ADMIN)];

export const courseRouter = Router();

courseRouter.get("/", validate(listCoursesQuerySchema, "query"), controller.list);
courseRouter.get("/:id", optionalAuth, controller.getOne);

courseRouter.post("/", requireAuth, requireRole(ROLES.TEACHER), validate(courseSchema), controller.create);
courseRouter.patch("/:id", ...managers, validate(updateCourseSchema), controller.update);
courseRouter.delete("/:id", ...managers, controller.remove);

courseRouter.post("/:id/join", requireAuth, requireRole(ROLES.STUDENT), controller.join);
courseRouter.delete("/:id/join", requireAuth, requireRole(ROLES.STUDENT), controller.cancelJoin);

courseRouter.post("/:id/requests/:studentId/accept", ...managers, controller.acceptRequest);
courseRouter.post("/:id/requests/:studentId/reject", ...managers, controller.rejectRequest);
courseRouter.put("/:id/grades/:studentId", ...managers, validate(gradeSchema), controller.grade);
