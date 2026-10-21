import { unlink } from "node:fs/promises";
import path from "node:path";
import { badRequest, notFound } from "../../shared/utils/AppError.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import { assertObjectId } from "../../shared/utils/objectId.js";
import { Course } from "../courses/course.model.js";
import { toPerson } from "../courses/course.serializers.js";
import { CVS_DIR, PHOTOS_DIR } from "../uploads/upload.paths.js";
import { PERSON_FIELDS, ROLES } from "../users/user.constants.js";
import { User } from "../users/user.model.js";

const removeFile = (dir, name) => (name ? unlink(path.join(dir, path.basename(name))).catch(() => undefined) : undefined);

export async function listUsers({ role, status, q }) {
  const filter = { role: role ?? { $ne: ROLES.ADMIN } };
  if (status === "pending") filter.isApproved = false;
  if (status === "approved") filter.isApproved = true;
  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ firstName: pattern }, { lastName: pattern }, { email: pattern }, { telephone: pattern }];
  }

  const users = await User.find(filter).select("+cv").sort({ createdAt: -1 });
  return users.map((user) => ({ ...user.toJSON(), hasCv: Boolean(user.cv), childCount: user.children.length }));
}

async function findUser(userId) {
  assertObjectId(userId, "User");
  const user = await User.findById(userId).select("+cv");
  if (!user) throw notFound("User");
  return user;
}

export async function approveUser(userId) {
  const user = await findUser(userId);
  user.isApproved = true;
  await user.save();
  return user;
}

export async function deleteUser(userId, admin) {
  const user = await findUser(userId);
  if (user.role === ROLES.ADMIN) throw badRequest("Admin accounts cannot be deleted from the dashboard");
  if (String(user._id) === String(admin._id)) throw badRequest("You cannot delete your own account");

  if (user.role === ROLES.TEACHER) {
    await Course.deleteMany({ teacher: user._id });
  }
  if (user.role === ROLES.STUDENT) {
    await Course.updateMany(
      {},
      { $pull: { students: user._id, pendingStudents: user._id, grades: { student: user._id } } },
    );
    await User.updateMany({ children: user._id }, { $pull: { children: user._id } });
  }

  await user.deleteOne();
  await Promise.all([removeFile(PHOTOS_DIR, user.photo), removeFile(CVS_DIR, user.cv)]);
}

export async function cvPath(userId) {
  const user = await findUser(userId);
  if (!user.cv) throw notFound("CV");
  return { file: path.join(CVS_DIR, path.basename(user.cv)), name: `${user.firstName}-${user.lastName}-cv.pdf` };
}

export async function pendingRequests() {
  const courses = await Course.find({ "pendingStudents.0": { $exists: true } }, "name pendingStudents")
    .populate("pendingStudents", PERSON_FIELDS)
    .lean();

  return courses.flatMap((course) =>
    course.pendingStudents.map((student) => ({
      course: { id: String(course._id), name: course.name },
      student: toPerson(student),
    })),
  );
}

export async function stats() {
  const [byRole, pendingTeachers, courses] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.countDocuments({ role: ROLES.TEACHER, isApproved: false }),
    Course.countDocuments(),
  ]);
  const counts = Object.fromEntries(byRole.map((row) => [row._id, row.count]));
  return {
    teachers: counts.teacher ?? 0,
    students: counts.student ?? 0,
    parents: counts.parent ?? 0,
    pendingTeachers,
    courses,
  };
}
