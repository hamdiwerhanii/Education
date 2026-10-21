import { Router } from "express";
import { requireAuth, requireRole } from "../../shared/middleware/auth.js";
import { Course } from "../courses/course.model.js";
import { gradeFor, toCourseSummary, toPerson } from "../courses/course.serializers.js";
import { teacherCourses } from "../courses/course.service.js";
import { PERSON_FIELDS, ROLES } from "../users/user.constants.js";
import { User } from "../users/user.model.js";

async function studentCourses(studentId) {
  const [enrolled, pending] = await Promise.all([
    Course.find({ students: studentId }).sort({ createdAt: -1 }).populate("teacher", PERSON_FIELDS).lean(),
    Course.find({ pendingStudents: studentId }).sort({ createdAt: -1 }).populate("teacher", PERSON_FIELDS).lean(),
  ]);

  return {
    courses: enrolled.map((course) => ({ ...toCourseSummary(course), grade: gradeFor(course, studentId) })),
    pending: pending.map(toCourseSummary),
  };
}

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/courses", requireRole(ROLES.TEACHER, ROLES.STUDENT), async (req, res) => {
  if (req.user.role === ROLES.TEACHER) {
    return res.json({ courses: await teacherCourses(req.user), pending: [] });
  }
  res.json(await studentCourses(req.user._id));
});

meRouter.get("/children", requireRole(ROLES.PARENT), async (req, res) => {
  const children = await User.find({ _id: { $in: req.user.children }, role: ROLES.STUDENT }, PERSON_FIELDS).lean();

  const results = await Promise.all(
    children.map(async (child) => ({
      ...toPerson(child),
      ...(await studentCourses(child._id)),
    })),
  );

  res.json({ children: results });
});
