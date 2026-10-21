import mongoose from "mongoose";
import { toJSONOptions } from "../../shared/utils/toJSON.js";
import { ALL_ROLES } from "./user.constants.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    telephone: { type: String, required: true, unique: true, match: /^\d{8}$/ },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, required: true, index: true },
    isApproved: { type: Boolean, default: true },
    address: { type: String, trim: true, maxlength: 200, default: "" },
    speciality: { type: String, trim: true, maxlength: 100, default: "" },
    photo: { type: String, default: "" },
    cv: { type: String, default: "", select: false },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: toJSONOptions(["passwordHash", "cv", "photo"]) },
);

userSchema.virtual("photoUrl").get(function photoUrl() {
  return this.photo ? `/uploads/photos/${this.photo}` : null;
});

export const User = mongoose.model("User", userSchema);
