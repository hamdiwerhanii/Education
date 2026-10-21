import { z } from "zod";

export const COURSES_PAGE_SIZE = 9;

export const courseSchema = z.object({
  name: z.string().trim().min(3, "Use at least 3 characters").max(100, "Use at most 100 characters"),
  description: z.string().trim().min(10, "Use at least 10 characters").max(2000, "Use at most 2000 characters"),
  durationMinutes: z.coerce
    .number("Enter a number of minutes")
    .int("Use whole minutes")
    .min(1, "Must be at least 1 minute")
    .max(10000, "Must be at most 10000 minutes"),
});

export const updateCourseSchema = courseSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Send at least one field to update",
});

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(COURSES_PAGE_SIZE),
  q: z.string().trim().max(100).optional(),
});

export const gradeSchema = z.object({
  mark: z.coerce.number("Enter a mark").min(0, "The mark must be between 0 and 20").max(20, "The mark must be between 0 and 20"),
  evaluation: z.string().trim().max(500, "Use at most 500 characters").default(""),
});
