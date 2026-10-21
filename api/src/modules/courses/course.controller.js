import * as courseService from "./course.service.js";

export async function list(req, res) {
  res.json(await courseService.listCourses(req.validated.query));
}

export async function getOne(req, res) {
  res.json(await courseService.getCourse(req.params.id, req.user));
}

export async function create(req, res) {
  res.status(201).json({ course: await courseService.createCourse(req.validated.body, req.user) });
}

export async function update(req, res) {
  res.json({ course: await courseService.updateCourse(req.params.id, req.validated.body, req.user) });
}

export async function remove(req, res) {
  await courseService.deleteCourse(req.params.id, req.user);
  res.status(204).end();
}

export async function join(req, res) {
  await courseService.requestToJoin(req.params.id, req.user);
  res.status(201).json({ status: "pending" });
}

export async function cancelJoin(req, res) {
  await courseService.cancelRequest(req.params.id, req.user);
  res.status(204).end();
}

export async function acceptRequest(req, res) {
  await courseService.acceptRequest(req.params.id, req.params.studentId, req.user);
  res.status(204).end();
}

export async function rejectRequest(req, res) {
  await courseService.rejectRequest(req.params.id, req.params.studentId, req.user);
  res.status(204).end();
}

export async function grade(req, res) {
  res.json({ grade: await courseService.setGrade(req.params.id, req.params.studentId, req.validated.body, req.user) });
}
