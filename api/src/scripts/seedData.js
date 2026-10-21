import { randomUUID } from "node:crypto";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { Course } from "../modules/courses/course.model.js";
import { PHOTOS_DIR } from "../modules/uploads/upload.paths.js";
import { ROLES } from "../modules/users/user.constants.js";
import { User } from "../modules/users/user.model.js";

const THEME_IMAGES = fileURLToPath(new URL("../../../client/public/assets/img/", import.meta.url));
const PASSWORD = "Demo@1234";

const PEOPLE = [
  { key: "admin", role: ROLES.ADMIN, firstName: "Amira", lastName: "Admin", telephone: "10000000", image: "avatar/avatar-illustrated-02.webp", note: "Admin dashboard" },
  { key: "sami", role: ROLES.TEACHER, firstName: "Sami", lastName: "Ben Ali", telephone: "20000001", speciality: "Web development", image: "gallery/team1.png", note: "Approved teacher" },
  { key: "leila", role: ROLES.TEACHER, firstName: "Leila", lastName: "Trabelsi", telephone: "20000002", speciality: "Mathematics", image: "gallery/team2.png", note: "Approved teacher" },
  { key: "karim", role: ROLES.TEACHER, firstName: "Karim", lastName: "Haddad", telephone: "20000003", speciality: "Physics", image: "gallery/team3.png", note: "Approved teacher" },
  { key: "nour", role: ROLES.TEACHER, firstName: "Nour", lastName: "Gharbi", telephone: "20000004", speciality: "English literature", image: "gallery/team4.png", isApproved: false, note: "Waiting for approval" },
  { key: "yassine", role: ROLES.STUDENT, firstName: "Yassine", lastName: "Mansour", telephone: "30000001", image: "avatar/avatar-face-02.webp", note: "Student" },
  { key: "ines", role: ROLES.STUDENT, firstName: "Ines", lastName: "Jaziri", telephone: "30000002", image: "avatar/avatar-face-03.webp", note: "Student" },
  { key: "omar", role: ROLES.STUDENT, firstName: "Omar", lastName: "Kefi", telephone: "30000003", image: "avatar/avatar-face-04.webp", note: "Student" },
  { key: "hela", role: ROLES.PARENT, firstName: "Hela", lastName: "Mansour", telephone: "40000001", children: ["yassine", "ines"], note: "Parent of Yassine and Ines" },
];

export const DEMO_ACCOUNTS = PEOPLE.map(({ role, telephone, note }) => ({ role, telephone, password: PASSWORD, note }));

const COURSES = [
  {
    name: "Modern Web Development",
    description: "Build responsive websites with HTML, CSS and JavaScript, then connect them to a real API.",
    durationMinutes: 600,
    teacher: "sami",
    students: ["yassine", "ines"],
    pending: ["omar"],
    grades: [
      { student: "yassine", mark: 16.5, evaluation: "Great project structure and clean code." },
      { student: "ines", mark: 14, evaluation: "Good work, keep practising JavaScript." },
    ],
  },
  {
    name: "Angular for Beginners",
    description: "Components, signals, routing and forms: everything you need to build your first Angular app.",
    durationMinutes: 480,
    teacher: "sami",
    students: ["omar"],
    pending: [],
    grades: [],
  },
  {
    name: "Algebra Essentials",
    description: "Equations, functions and inequalities explained step by step with plenty of exercises.",
    durationMinutes: 360,
    teacher: "leila",
    students: ["yassine", "omar"],
    pending: ["ines"],
    grades: [{ student: "yassine", mark: 12, evaluation: "Solid basics, review quadratic equations." }],
  },
  {
    name: "Introduction to Physics",
    description: "Motion, forces and energy, with simple experiments you can reproduce at home.",
    durationMinutes: 420,
    teacher: "karim",
    students: ["ines"],
    pending: [],
    grades: [{ student: "ines", mark: 18, evaluation: "Excellent lab reports." }],
  },
];

async function copyThemeImage(relativePath) {
  if (!relativePath) return "";
  const name = `${randomUUID()}${path.extname(relativePath)}`;
  await copyFile(path.join(THEME_IMAGES, relativePath), path.join(PHOTOS_DIR, name)).catch(() => undefined);
  return name;
}

export async function seedDatabase() {
  await Promise.all([User.deleteMany({}), Course.deleteMany({})]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const ids = {};

  for (const person of PEOPLE.filter((p) => p.role !== ROLES.PARENT)) {
    const user = await User.create({
      firstName: person.firstName,
      lastName: person.lastName,
      email: `${person.key}@education.dev`,
      telephone: person.telephone,
      passwordHash,
      role: person.role,
      isApproved: person.isApproved ?? true,
      speciality: person.speciality ?? "",
      photo: await copyThemeImage(person.image),
    });
    ids[person.key] = user._id;
  }

  for (const parent of PEOPLE.filter((p) => p.role === ROLES.PARENT)) {
    const user = await User.create({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: `${parent.key}@education.dev`,
      telephone: parent.telephone,
      passwordHash,
      role: ROLES.PARENT,
      children: parent.children.map((key) => ids[key]),
    });
    ids[parent.key] = user._id;
  }

  await Course.create(
    COURSES.map((course) => ({
      name: course.name,
      description: course.description,
      durationMinutes: course.durationMinutes,
      teacher: ids[course.teacher],
      students: course.students.map((key) => ids[key]),
      pendingStudents: course.pending.map((key) => ids[key]),
      grades: course.grades.map((grade) => ({ ...grade, student: ids[grade.student] })),
    })),
  );

  return { users: PEOPLE.length, courses: COURSES.length };
}
