import { z } from "zod";
import { ROLES, SELF_SIGNUP_ROLES } from "../users/user.constants.js";

export const telephone = z.string().trim().regex(/^\d{8}$/, "Use exactly 8 digits");
const name = (label) => z.string().trim().min(2, `${label} must have at least 2 characters`).max(50);
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

export const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a special character");

const toArray = (value) => {
  if (value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
};

export const signUpSchema = z
  .object({
    role: z.enum(SELF_SIGNUP_ROLES, "Choose student, teacher or parent"),
    firstName: name("First name"),
    lastName: name("Last name"),
    email,
    telephone,
    password: strongPassword,
    address: z.string().trim().max(200).default(""),
    speciality: z.string().trim().max(100).default(""),
    childTelephones: z.preprocess(toArray, z.array(telephone).max(10, "Add at most 10 children")).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.TEACHER && data.speciality.length < 2) {
      ctx.addIssue({ code: "custom", path: ["speciality"], message: "Teachers must enter a speciality" });
    }
    if (data.role === ROLES.PARENT && data.childTelephones.length === 0) {
      ctx.addIssue({ code: "custom", path: ["childTelephones"], message: "Add at least one child telephone" });
    }
  });

export const loginSchema = z.object({
  telephone,
  password: z.string().min(1, "Enter your password"),
});
