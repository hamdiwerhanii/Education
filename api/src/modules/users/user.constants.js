export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
};

export const ALL_ROLES = Object.values(ROLES);
export const SELF_SIGNUP_ROLES = [ROLES.STUDENT, ROLES.TEACHER, ROLES.PARENT];

export const PUBLIC_PROFILE_FIELDS = "firstName lastName role speciality photo";
export const PERSON_FIELDS = "firstName lastName photo";
