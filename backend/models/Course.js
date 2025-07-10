const mongoose = require("mongoose");
const { timestamp } = require("rxjs");

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the teacher is stored in the User collection
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // List of students assigned to the course
      },
    ],
    grades: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        mark: Number,
        evaluation: String,
      },
    ],
  },
  { timestamp: true }
);

module.exports = mongoose.model("Course", courseSchema);
