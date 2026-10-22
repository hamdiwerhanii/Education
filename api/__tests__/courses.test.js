import request from "supertest";
import { Course } from "../src/modules/courses/course.model.js";
import { app, createCourse, createUser, loginAsAdmin, loginAsStudent, loginAsTeacher } from "./helpers.js";

const COURSE = { name: "Web Basics", description: "HTML, CSS and JavaScript fundamentals.", durationMinutes: 120 };

describe("public course pages", () => {
  it("lists courses with teacher names and student counts, but no student details", async () => {
    const teacher = await createUser({ role: "teacher", speciality: "Web", firstName: "Sami" });
    const student = await createUser();
    await createCourse(teacher, { students: [student._id] });

    const res = await request(app).get("/api/courses").expect(200);

    expect(res.body.courses[0]).toMatchObject({ studentCount: 1, teacher: { firstName: "Sami" } });
    expect(res.body.courses[0].students).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(student.email);
  });

  it("searches course names literally", async () => {
    const teacher = await createUser({ role: "teacher", speciality: "Web" });
    await createCourse(teacher, { name: "Physics 101" });

    expect((await request(app).get("/api/courses?q=phys").expect(200)).body.total).toBe(1);
    expect((await request(app).get("/api/courses?q=.*").expect(200)).body.total).toBe(0);
  });

  it("also searches course descriptions", async () => {
    const teacher = await createUser({ role: "teacher", speciality: "Maths" });
    await createCourse(teacher, { name: "Algebra Basics", description: "Equations and functions for beginners." });

    expect((await request(app).get("/api/courses?q=functions").expect(200)).body.total).toBe(1);
  });

  it("returns 404 for unknown or invalid course ids", async () => {
    await request(app).get("/api/courses/not-an-id").expect(404);
    await request(app).get("/api/courses/507f1f77bcf86cd799439011").expect(404);
  });
});

describe("managing courses", () => {
  it("lets approved teachers create courses for themselves", async () => {
    const { agent, user } = await loginAsTeacher();
    const res = await agent.post("/api/courses").send({ ...COURSE, teacher: "someone-else" }).expect(201);

    expect(res.body.course.teacher.id).toBe(String(user._id));
  });

  it("does not let students or visitors create courses", async () => {
    const { agent } = await loginAsStudent();
    await agent.post("/api/courses").send(COURSE).expect(403);
    await request(app).post("/api/courses").send(COURSE).expect(401);
  });

  it("validates course data", async () => {
    const { agent } = await loginAsTeacher();
    const res = await agent.post("/api/courses").send({ name: "A", description: "short", durationMinutes: -5 }).expect(400);

    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(["name", "description", "durationMinutes"]));
  });

  it("only lets the owner teacher or an admin edit and delete a course", async () => {
    const { agent: owner, user } = await loginAsTeacher();
    const { agent: otherTeacher } = await loginAsTeacher();
    const { agent: admin } = await loginAsAdmin();
    const course = await createCourse(user);

    await otherTeacher.patch(`/api/courses/${course.id}`).send({ name: "Hijacked" }).expect(403);
    await otherTeacher.delete(`/api/courses/${course.id}`).expect(403);

    const edited = await owner.patch(`/api/courses/${course.id}`).send({ name: "Algebra II" }).expect(200);
    expect(edited.body.course.name).toBe("Algebra II");

    await admin.delete(`/api/courses/${course.id}`).expect(204);
    expect(await Course.countDocuments()).toBe(0);
  });
});

describe("enrolment and grades", () => {
  async function setup() {
    const { agent: teacher, user: teacherUser } = await loginAsTeacher();
    const { agent: student, user: studentUser } = await loginAsStudent();
    const course = await createCourse(teacherUser);
    return { teacher, student, studentUser, course };
  }

  it("runs the full request → accept → grade flow", async () => {
    const { teacher, student, studentUser, course } = await setup();

    await student.post(`/api/courses/${course.id}/join`).expect(201);
    await student.post(`/api/courses/${course.id}/join`).expect(409);
    expect((await student.get(`/api/courses/${course.id}`)).body.viewer).toMatchObject({ isPending: true, isEnrolled: false });

    await teacher.post(`/api/courses/${course.id}/requests/${studentUser.id}/accept`).expect(204);
    expect((await student.get(`/api/courses/${course.id}`)).body.viewer.isEnrolled).toBe(true);

    await teacher.put(`/api/courses/${course.id}/grades/${studentUser.id}`).send({ mark: 15.5, evaluation: "Well done" }).expect(200);

    const mine = await student.get("/api/me/courses").expect(200);
    expect(mine.body.courses[0].grade).toMatchObject({ mark: 15.5, evaluation: "Well done" });
  });

  it("refuses marks outside 0-20 and grades for students who are not enrolled", async () => {
    const { teacher, studentUser, course } = await setup();

    await teacher.put(`/api/courses/${course.id}/grades/${studentUser.id}`).send({ mark: 25 }).expect(400);
    await teacher.put(`/api/courses/${course.id}/grades/${studentUser.id}`).send({ mark: 10 }).expect(400);
  });

  it("does not let students accept their own requests or grade themselves", async () => {
    const { student, studentUser, course } = await setup();
    await student.post(`/api/courses/${course.id}/join`).expect(201);

    await student.post(`/api/courses/${course.id}/requests/${studentUser.id}/accept`).expect(403);
    await student.put(`/api/courses/${course.id}/grades/${studentUser.id}`).send({ mark: 20 }).expect(403);
  });

  it("lets a student cancel a pending request and a teacher reject one", async () => {
    const { teacher, student, studentUser, course } = await setup();

    await student.post(`/api/courses/${course.id}/join`).expect(201);
    await student.delete(`/api/courses/${course.id}/join`).expect(204);
    await student.post(`/api/courses/${course.id}/join`).expect(201);
    await teacher.post(`/api/courses/${course.id}/requests/${studentUser.id}/reject`).expect(204);

    expect((await Course.findById(course.id)).pendingStudents).toHaveLength(0);
  });

  it("shows teachers only their own courses with students, grades and requests", async () => {
    const { teacher, student, course } = await setup();
    const { user: otherTeacher } = await loginAsTeacher();
    await createCourse(otherTeacher, { name: "Not mine" });
    await student.post(`/api/courses/${course.id}/join`).expect(201);

    const res = await teacher.get("/api/me/courses").expect(200);
    expect(res.body.courses.map((c) => c.name)).toEqual(["Algebra Basics"]);
    expect(res.body.courses[0].pendingStudents).toHaveLength(1);
  });
});

describe("parents", () => {
  it("see only their own children's courses and grades", async () => {
    const child = await createUser();
    const stranger = await createUser();
    const teacher = await createUser({ role: "teacher", speciality: "Maths" });
    await createCourse(teacher, {
      students: [child._id, stranger._id],
      grades: [{ student: child._id, mark: 17, evaluation: "Great" }, { student: stranger._id, mark: 5 }],
    });
    const { agent } = await loginAsStudent({ role: "parent", children: [child._id] });

    const res = await agent.get("/api/me/children").expect(200);

    expect(res.body.children).toHaveLength(1);
    expect(res.body.children[0].courses[0].grade).toMatchObject({ mark: 17, evaluation: "Great" });
  });

  it("cannot open the student or teacher course endpoint", async () => {
    const { agent } = await loginAsStudent({ role: "parent" });
    await agent.get("/api/me/courses").expect(403);
  });
});
