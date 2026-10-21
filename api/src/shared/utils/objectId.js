import mongoose from "mongoose";
import { notFound } from "./AppError.js";

export function assertObjectId(id, what) {
  if (!mongoose.isValidObjectId(id)) throw notFound(what);
}

export const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);
