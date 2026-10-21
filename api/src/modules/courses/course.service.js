import { badRequest, conflict, forbidden, notFound } from "../../shared/utils/AppError.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import { assertObjectId, sameId } from "../../shared/utils/objectId.js";
import { PERSON_FIELDS, ROLES } from "../users/user.constants.js";
import { Course } from "./course.model.js";
import { toCourseSummary, toManagedCourse } from "./course.serializers.js";

const canManage = (course, user) =>
  Boolean(user) && (user.role === ROLES.ADMIN || sameId(course.teacher, user._id ?? user.id));

async function findCourse(courseId) {
  assertObjectId(courseId, "Course");
  const course = await Course.findById(courseId);
  if (!course) throw notFound("Course");
  return course;
}

async function findManageableCourse(courseId, user) {
  const course = await findCourse(courseId);
  if (!canManage(course, user)) throw forbidden("Only the course teacher or an admin can do that");
  return course;
}

const populateForManagement = (query) =>
  query
    .populate("teacher", PERSON_FIELDS)
    .populate("students", PERSON_FIELDS)
    .populate("pendingStudents", PERSON_FIELDS);

export async function listCourses({ page, limit, q, teacherId }) {
  const filter = {};
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
  if (teacherId) filter.teacher = teacherId;

  const [courses, total] = await Promise.all([
    Course.find(filter, "name description durationMinutes teacher students createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("teacher", PERSON_FIELDS)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return {
    courses: courses.map(toCourseSummary),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getCourse(courseId, viewer) {
  assertObjectId(courseId, "Course");
  const course = await populateForManagement(Course.findById(courseId)).lean();
  if (!course) throw notFound("Course");

  const manage = canManage(course, viewer);
  const viewerId = viewer?._id;

  return {
    course: manage ? toManagedCourse(course) : toCourseSummary(course),
    viewer: {
      canManage: manage,
      isEnrolled: Boolean(viewerId) && course.students.some((s) => sameId(s, viewerId)),
      isPending: Boolean(viewerId) && course.pendingStudents.some((s) => sameId(s, viewerId)),
    },
  };
}

export async function createCourse(data, teacher) {
  const course = await Course.create({ ...data, teacher: teacher._id });
  return toCourseSummary(await course.populate("teacher", PERSON_FIELDS));
}

export async function updateCourse(courseId, data, user) {
  const course = await findManageableCourse(courseId, user);
  course.set(data);
  await course.save();
  return toCourseSummary(await course.populate("teacher", PERSON_FIELDS));
}

export async function deleteCourse(courseId, user) {
  const course = await findManageableCourse(courseId, user);
  await course.deleteOne();
}

export async function requestToJoin(courseId, student) {
  const course = await findCourse(courseId);
  if (course.students.some((s) => sameId(s, student._id))) throw conflict("You are already enrolled in this course");
  if (course.pendingStudents.some((s) => sameId(s, student._id))) throw conflict("Your request is already pending");

  course.pendingStudents.push(student._id);
  await course.save();
}

export async function cancelRequest(courseId, student) {
  const course = await findCourse(courseId);
  course.pendingStudents.pull(student._id);
  await course.save();
}

async function findPendingStudent(course, studentId) {
  assertObjectId(studentId, "Student");
  if (!course.pendingStudents.some((s) => sameId(s, studentId))) throw notFound("Pending request");
}

export async function acceptRequest(courseId, studentId, user) {
  const course = await findManageableCourse(courseId, user);
  await findPendingStudent(course, studentId);

  course.pendingStudents.pull(studentId);
  course.students.addToSet(studentId);
  await course.save();
}

export async function rejectRequest(courseId, studentId, user) {
  const course = await findManageableCourse(courseId, user);
  await findPendingStudent(course, studentId);

  course.pendingStudents.pull(studentId);
  await course.save();
}

export async function setGrade(courseId, studentId, { mark, evaluation }, user) {
  const course = await findManageableCourse(courseId, user);
  assertObjectId(studentId, "Student");
  if (!course.students.some((s) => sameId(s, studentId))) {
    throw badRequest("Only enrolled students can be graded");
  }

  const existing = course.grades.find((g) => sameId(g.student, studentId));
  if (existing) {
    existing.mark = mark;
    existing.evaluation = evaluation;
  } else {
    course.grades.push({ student: studentId, mark, evaluation });
  }
  await course.save();

  return { mark, evaluation };
}

export async function teacherCourses(teacher) {
  const courses = await populateForManagement(Course.find({ teacher: teacher._id }).sort({ createdAt: -1 })).lean();
  return courses.map(toManagedCourse);
}
