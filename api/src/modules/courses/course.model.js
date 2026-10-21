import mongoose from "mongoose";
import { toJSONOptions } from "../../shared/utils/toJSON.js";

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mark: { type: Number, required: true, min: 0, max: 20 },
    evaluation: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false, timestamps: true },
);

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    durationMinutes: { type: Number, required: true, min: 1, max: 10000 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    pendingStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    grades: [gradeSchema],
  },
  { timestamps: true, toJSON: toJSONOptions() },
);

courseSchema.index({ createdAt: -1 });

export const Course = mongoose.model("Course", courseSchema);
