import request from "supertest";
import { Course } from "../src/modules/courses/course.model.js";
import { User } from "../src/modules/users/user.model.js";
import { app, createCourse, createUser, loginAsAdmin, loginAsStudent, loginAsTeacher, PDF_BYTES, signUp, signUpFields } from "./helpers.js";

describe("admin access", () => {
  it("is refused to visitors, students and teachers", async () => {
    await request(app).get("/api/admin/users").expect(401);
    await (await loginAsStudent()).agent.get("/api/admin/users").expect(403);
    await (await loginAsTeacher()).agent.get("/api/admin/users").expect(403);
  });

  it("lists users without password hashes or admins", async () => {
    const { agent } = await loginAsAdmin();
    await createUser({ role: "teacher", speciality: "Maths", isApproved: false });

    const res = await agent.get("/api/admin/users").expect(200);

    expect(res.body.users).toHaveLength(1);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });
});

describe("admin actions", () => {
  it("approves a pending teacher, who can then log in", async () => {
    const { agent } = await loginAsAdmin();
    const teacher = await createUser({ role: "teacher", speciality: "Maths", isApproved: false });

    await agent.post(`/api/admin/users/${teacher.id}/approve`).expect(200);
    await request(app).post("/api/auth/login").send({ telephone: teacher.telephone, password: "Str0ng@Pass" }).expect(200);
  });

  it("deleting a teacher removes their courses", async () => {
    const { agent } = await loginAsAdmin();
    const teacher = await createUser({ role: "teacher", speciality: "Maths" });
    await createCourse(teacher);

    await agent.delete(`/api/admin/users/${teacher.id}`).expect(204);
    expect(await Course.countDocuments()).toBe(0);
  });

  it("deleting a student removes them from courses, grades and parents", async () => {
    const { agent } = await loginAsAdmin();
    const teacher = await createUser({ role: "teacher", speciality: "Maths" });
    const student = await createUser();
    const parent = await createUser({ role: "parent", children: [student._id] });
    const course = await createCourse(teacher, { students: [student._id], grades: [{ student: student._id, mark: 12 }] });

    await agent.delete(`/api/admin/users/${student.id}`).expect(204);

    const updated = await Course.findById(course.id);
    expect(updated.students).toHaveLength(0);
    expect(updated.grades).toHaveLength(0);
    expect((await User.findById(parent.id)).children).toHaveLength(0);
  });

  it("cannot delete admins", async () => {
    const { agent, user } = await loginAsAdmin();
    await agent.delete(`/api/admin/users/${user.id}`).expect(400);
  });

  it("lists pending enrolment requests across courses", async () => {
    const { agent } = await loginAsAdmin();
    const teacher = await createUser({ role: "teacher", speciality: "Maths" });
    const student = await createUser({ firstName: "Ines" });
    await createCourse(teacher, { pendingStudents: [student._id] });

    const res = await agent.get("/api/admin/requests").expect(200);
    expect(res.body.requests[0]).toMatchObject({ course: { name: "Algebra Basics" }, student: { firstName: "Ines" } });
  });

  it("serves teacher CVs only to admins", async () => {
    const signup = await signUp(signUpFields({ role: "teacher", speciality: "Physics" }), {
      cv: { buffer: PDF_BYTES, options: { filename: "cv.pdf", contentType: "application/pdf" } },
    }).expect(201);
    const teacherId = signup.body.user.id;
    const { agent } = await loginAsAdmin();

    const res = await agent.get(`/api/admin/users/${teacherId}/cv`).expect(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    await request(app).get(`/uploads/cvs/${teacherId}.pdf`).expect(404);
  });

  it("reports platform statistics", async () => {
    const { agent } = await loginAsAdmin();
    await createUser({ role: "teacher", speciality: "Maths", isApproved: false });
    await createUser();

    const res = await agent.get("/api/admin/stats").expect(200);
    expect(res.body.stats).toMatchObject({ teachers: 1, students: 1, pendingTeachers: 1, courses: 0 });
  });
});

describe("app", () => {
  it("sends security headers and JSON 404s", async () => {
    const res = await request(app).get("/api/nope").expect(404);

    expect(res.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.body.error.message).toContain("not found");
  });

  it("lists only approved teachers publicly, without private data", async () => {
    await createUser({ role: "teacher", speciality: "Maths", firstName: "Leila" });
    await createUser({ role: "teacher", speciality: "Physics", isApproved: false });

    const res = await request(app).get("/api/teachers").expect(200);
    expect(res.body.teachers).toHaveLength(1);
    expect(res.body.teachers[0]).toEqual(expect.objectContaining({ firstName: "Leila", speciality: "Maths" }));
    expect(res.body.teachers[0].email).toBeUndefined();
    expect(res.body.teachers[0].telephone).toBeUndefined();
  });
});
