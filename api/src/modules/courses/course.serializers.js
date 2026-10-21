import { sameId } from "../../shared/utils/objectId.js";

export const photoUrl = (photo) => (photo ? `/uploads/photos/${photo}` : null);

export const toPerson = (user) =>
  user && {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: photoUrl(user.photo),
  };

export const toCourseSummary = (course) => ({
  id: String(course._id),
  name: course.name,
  description: course.description,
  durationMinutes: course.durationMinutes,
  teacher: toPerson(course.teacher),
  studentCount: course.students?.length ?? 0,
  createdAt: course.createdAt,
});

export const gradeFor = (course, studentId) => {
  const grade = course.grades?.find((g) => sameId(g.student, studentId));
  return grade ? { mark: grade.mark, evaluation: grade.evaluation, updatedAt: grade.updatedAt } : null;
};

export const toManagedCourse = (course) => ({
  ...toCourseSummary(course),
  students: (course.students ?? []).map((student) => ({ ...toPerson(student), grade: gradeFor(course, student._id) })),
  pendingStudents: (course.pendingStudents ?? []).map(toPerson),
});
