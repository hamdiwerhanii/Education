import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";
import { notFound } from "../../shared/utils/AppError.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import { assertObjectId } from "../../shared/utils/objectId.js";
import { toPerson } from "../courses/course.serializers.js";
import { listCourses } from "../courses/course.service.js";
import { PUBLIC_PROFILE_FIELDS, ROLES } from "../users/user.constants.js";
import { User } from "../users/user.model.js";

const listTeachersQuerySchema = z.object({ q: z.string().trim().max(100).optional() });

const toTeacher = (teacher) => ({ ...toPerson(teacher), speciality: teacher.speciality });

const approvedTeachers = { role: ROLES.TEACHER, isApproved: true };

export const teacherRouter = Router();

teacherRouter.get("/", validate(listTeachersQuerySchema, "query"), async (req, res) => {
  const { q } = req.validated.query;
  const filter = { ...approvedTeachers };
  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ firstName: pattern }, { lastName: pattern }, { speciality: pattern }];
  }

  const teachers = await User.find(filter, PUBLIC_PROFILE_FIELDS).sort({ lastName: 1, firstName: 1 }).lean();
  res.json({ teachers: teachers.map(toTeacher) });
});

teacherRouter.get("/:id", async (req, res) => {
  assertObjectId(req.params.id, "Teacher");
  const teacher = await User.findOne({ _id: req.params.id, ...approvedTeachers }, PUBLIC_PROFILE_FIELDS).lean();
  if (!teacher) throw notFound("Teacher");

  const { courses } = await listCourses({ page: 1, limit: 30, teacherId: teacher._id });
  res.json({ teacher: toTeacher(teacher), courses });
});
