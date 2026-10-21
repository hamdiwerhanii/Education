import request from "supertest";
import { User } from "../src/modules/users/user.model.js";
import { app, createUser, loginAsStudent, PASSWORD, PDF_BYTES, PNG_BYTES, signUp, signUpFields } from "./helpers.js";

describe("sign up", () => {
  it("creates a student, logs them in and never returns the password hash", async () => {
    const res = await signUp(signUpFields()).expect(201);

    expect(res.body.user).toMatchObject({ role: "student", isApproved: true, telephone: "12345678" });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.pendingApproval).toBe(false);
    expect(res.headers["set-cookie"][0]).toMatch(/^token=.*HttpOnly/);
  });

  it("refuses to create an admin account", async () => {
    const res = await signUp(signUpFields({ role: "admin" })).expect(400);

    expect(res.body.error.details.role).toBeDefined();
    expect(await User.countDocuments({ role: "admin" })).toBe(0);
  });

  it("creates teachers as pending, without a session, and keeps their CV", async () => {
    const res = await signUp(signUpFields({ role: "teacher", speciality: "Physics" }), {
      photo: { buffer: PNG_BYTES, options: { filename: "me.png", contentType: "image/png" } },
      cv: { buffer: PDF_BYTES, options: { filename: "cv.pdf", contentType: "application/pdf" } },
    }).expect(201);

    expect(res.body).toMatchObject({ pendingApproval: true, user: { isApproved: false } });
    expect(res.body.user.photoUrl).toMatch(/^\/uploads\/photos\/[a-f0-9-]+\.png$/);
    expect(res.headers["set-cookie"]).toBeUndefined();

    const stored = await User.findById(res.body.user.id).select("+cv");
    expect(stored.cv).toMatch(/\.pdf$/);
  });

  it("requires a speciality for teachers", async () => {
    const res = await signUp(signUpFields({ role: "teacher" })).expect(400);
    expect(res.body.error.details.speciality).toBeDefined();
  });

  it("links parents to existing student accounts by telephone", async () => {
    const child = await createUser({ telephone: "33333333" });
    const res = await signUp(signUpFields({ role: "parent", childTelephones: ["33333333"] })).expect(201);

    const parent = await User.findById(res.body.user.id);
    expect(parent.children.map(String)).toEqual([String(child._id)]);
  });

  it("rejects a parent whose child telephone is unknown", async () => {
    const res = await signUp(signUpFields({ role: "parent", childTelephones: ["99999999"] })).expect(400);
    expect(res.body.error.details.childTelephones[0]).toContain("99999999");
  });

  it("reports which details are already in use", async () => {
    await signUp(signUpFields()).expect(201);
    const res = await signUp(signUpFields({ email: "other@example.com" })).expect(409);

    expect(res.body.error.details).toEqual({ telephone: ["This telephone is already in use"] });
  });

  it("enforces a strong password", async () => {
    const res = await signUp(signUpFields({ password: "weakpass" })).expect(400);
    expect(res.body.error.details.password).toBeDefined();
  });

  it("rejects a file whose content does not match its type", async () => {
    const res = await signUp(signUpFields(), {
      photo: { buffer: Buffer.from("<script>alert(1)</script>"), options: { filename: "x.png", contentType: "image/png" } },
    }).expect(400);

    expect(res.body.error.details.photo).toBeDefined();
    expect(await User.countDocuments()).toBe(0);
  });
});

describe("login", () => {
  it("logs in with telephone and password", async () => {
    const user = await createUser();
    const res = await request(app).post("/api/auth/login").send({ telephone: user.telephone, password: PASSWORD }).expect(200);

    expect(res.body.user.id).toBe(String(user._id));
  });

  it("uses one generic message for wrong passwords and unknown telephones", async () => {
    const user = await createUser();
    const wrong = await request(app).post("/api/auth/login").send({ telephone: user.telephone, password: "Wrong@123" }).expect(401);
    const unknown = await request(app).post("/api/auth/login").send({ telephone: "87654321", password: "Wrong@123" }).expect(401);

    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it("blocks teachers until an admin approves them", async () => {
    const teacher = await createUser({ role: "teacher", speciality: "Maths", isApproved: false });
    const res = await request(app).post("/api/auth/login").send({ telephone: teacher.telephone, password: PASSWORD }).expect(403);

    expect(res.body.error.message).toContain("approval");
  });
});

describe("session", () => {
  it("returns the current user and forgets them after logout", async () => {
    const { agent, user } = await loginAsStudent();

    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.user.id).toBe(String(user._id));

    await agent.post("/api/auth/logout").expect(204);
    const after = await agent.get("/api/auth/me").expect(200);
    expect(after.body.user).toBeNull();
  });

  it("ignores forged tokens", async () => {
    const me = await request(app).get("/api/auth/me").set("Cookie", "token=forged.token.value").expect(200);
    expect(me.body.user).toBeNull();
    await request(app).get("/api/me/courses").set("Cookie", "token=forged.token.value").expect(401);
  });
});
