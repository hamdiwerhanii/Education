import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { Course } from "../src/modules/courses/course.model.js";
import { ROLES } from "../src/modules/users/user.constants.js";
import { User } from "../src/modules/users/user.model.js";

export const app = createApp();
export const PASSWORD = "Str0ng@Pass";

const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);
let counter = 0;

const nextPhone = () => String(50000000 + (counter += 1));

export async function createUser(overrides = {}) {
  const telephone = overrides.telephone ?? nextPhone();
  return User.create({
    firstName: "Test",
    lastName: "User",
    email: `user${telephone}@example.com`,
    telephone,
    passwordHash: PASSWORD_HASH,
    role: ROLES.STUDENT,
    ...overrides,
  });
}

export async function loginAs(overrides = {}) {
  const user = await createUser(overrides);
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ telephone: user.telephone, password: PASSWORD }).expect(200);
  return { agent, user };
}

export const loginAsAdmin = () => loginAs({ role: ROLES.ADMIN });
export const loginAsTeacher = (overrides) => loginAs({ role: ROLES.TEACHER, speciality: "Maths", ...overrides });
export const loginAsStudent = (overrides) => loginAs({ role: ROLES.STUDENT, ...overrides });

export const createCourse = (teacher, overrides = {}) =>
  Course.create({
    name: "Algebra Basics",
    description: "Equations and functions for beginners.",
    durationMinutes: 90,
    teacher: teacher._id,
    ...overrides,
  });

export const signUpFields = (overrides = {}) => ({
  role: "student",
  firstName: "Yassine",
  lastName: "Mansour",
  email: "yassine@example.com",
  telephone: "12345678",
  password: PASSWORD,
  ...overrides,
});

export function signUp(fields, files = {}) {
  const req = request(app).post("/api/auth/signup");
  for (const [key, value] of Object.entries(fields)) {
    for (const item of [].concat(value)) req.field(key, item);
  }
  for (const [field, file] of Object.entries(files)) req.attach(field, file.buffer, file.options);
  return req;
}

export const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
export const PDF_BYTES = Buffer.from("%PDF-1.4\n%fake pdf for tests\n");
