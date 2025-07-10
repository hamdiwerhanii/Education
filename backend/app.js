// import express module
const express = require("express");

// import bodyParser module
const bodyParser = require("body-parser");

//  import mongoose module
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/educationDB");

// import bcrypt
const bcrypt = require("bcrypt");

// import multer
const multer = require("multer");

// import jwt module
const jwt = require("jsonwebtoken");

// import axios
const axios = require("axios");

// import express-session module
const session = require("express-session");

const path = require("path");

const secretKey = "your-secret-key";

const MIME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE[file.mimetype];
    if (!isValid) return cb(new Error("Invalid MIME type"));

    if (file.fieldname === "cv") {
      cb(null, "backend/files/cvs");
    } else {
      cb(null, "backend/files/photos");
    }
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const extension = MIME_TYPE[file.mimetype];
    const imgName = name + "-" + Date.now() + "-edu-" + "." + extension;
    cb(null, imgName);
  },
});

// creates an express app
const app = express();

app.use("/files", express.static(path.join("backend/files")));
app.use(
  session({
    secret: secretKey,
  })
);
// configuration :
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-with, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS, PATCH, PUT"
  );

  next();
});

// Models Importations
const User = require("./models/User");
const Course = require("./models/Course");

// Sign Up
app.post(
  "/api/users",
  multer({ storage: storage }).fields([
    { name: "img", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("user", req.body);
    const user = req.body;

    // ✅ Force success: true only for admins
    user.success = user.role === "admin";

    // ✅ Parse childTelephones for parent only
    if (user.role === "parent") {
      try {
        const parsedPhones = JSON.parse(user.childTelephones || "[]");
        user.childTelephones = parsedPhones
          .map((tel) => Number(tel))
          .filter((tel) => !isNaN(tel) && tel.toString().length === 8);
      } catch (e) {
        return res.json({ status: "INVALID CHILD TELEPHONE FORMAT" });
      }
    } else {
      delete user.childTelephones;
    }

    // ✅ Use $or to check both email and telephone uniqueness
    User.find({
      $or: [{ email: user.email }, { telephone: user.telephone }],
    }).then((docs) => {
      let emailExists = false;
      let telephoneExists = false;

      docs.forEach((doc) => {
        if (doc.email === user.email) emailExists = true;
        if (doc.telephone === Number(user.telephone)) telephoneExists = true;
      });

      if (emailExists || telephoneExists) {
        return res.json({
          status: "DUPLICATE FIELDS",
          emailExists,
          telephoneExists,
        });
      }

      // ✅ Validate child telephones if parent
      if (user.role === "parent") {
        User.find({
          telephone: { $in: user.childTelephones },
          role: "student",
        }).then((students) => {
          if (students.length !== user.childTelephones.length) {
            return res.json({ status: "INVALID CHILD TELEPHONE" });
          }
          proceedWithHashing();
        });
      } else {
        proceedWithHashing();
      }

      function proceedWithHashing() {
        bcrypt.hash(user.password, 12).then((hash) => {
          user.password = hash;

          if (req.files && req.files["img"]) {
            user.photo =
              "http://localhost:4000/files/photos/" +
              req.files["img"][0].filename;
          }

          if (req.files && req.files["cv"]) {
            user.cv =
              "http://localhost:4000/files/cvs/" + req.files["cv"][0].filename;
          }

          const newUser = new User(user);
          newUser.save((err, doc) => {
            console.log(err);
            console.log(doc);
            if (err) {
              res.json({ status: "Error" });
            } else {
              res.json({ status: "OK" });
            }
          });
        });
      }
    });
  }
);

// Login
app.post("/api/users/login", (req, res) => {
  console.log("login", req.body);
  const user = req.body;
  User.findOne({ telephone: user.telephone }).then((find) => {
    console.log("login", find);

    if (!find) {
      res.json({ status: "Check Your Phone" });
    } else {
      bcrypt.compare(user.password, find.password).then((result) => {
        if (!result) {
          res.json({ status: "Check Your Password" });
        } else {
          const userToSend = {
            firstName: find.firstName,
            lastName: find.lastName,
            photo: find.photo,
            role: find.role,
            success: find.success,
            _id: find._id,
            childTelephones: find.childTelephones,
          };
          const token = jwt.sign(userToSend, secretKey, {
            expiresIn: "1h",
          });
          res.json({ status: "OK", user: token });
        }
      });
    }
  });
});

app.get("/api/users", (req, res) => {
  console.log("get all users");
  User.find().then((users) => {
    res.json({ tab: users, status: "OK" });
  });
});

app.put("/api/users/validate", (req, res) => {
  console.log("update status");
  const id = req.body.userId;
  User.updateOne({ _id: id }, { success: true }, (err, doc) => {
    if (err) {
      console.log(err);
      res.json({ status: "Error" });
    } else {
      res.json({ status: "OK" });
    }
  });
});

// send request if role student
app.post("/api/users/join-request", async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ status: "USER_NOT_FOUND" });

    if (!user.requestedCourseIds.includes(courseId)) {
      user.requestedCourseIds.push(courseId);
      await user.save();
      return res.json({ status: "REQUEST_ADDED" });
    } else {
      return res.json({ status: "ALREADY_REQUESTED" });
    }
  } catch (err) {
    return res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// accept resquest if role admin
app.put("/api/users/accept-course-request", async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    // Ajouter au cours
    await Course.updateOne(
      { _id: courseId },
      { $addToSet: { students: studentId } }
    );

    // Supprimer la demande
    await User.updateOne(
      { _id: studentId },
      { $pull: { requestedCourseIds: courseId } }
    );

    res.json({ status: "ACCEPTED" });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.get("/api/users/:id", (req, res) => {
  console.log("get user by id", req.params.id);
  User.findById(req.params.id).then((doc) => {
    if (doc) {
      res.json({ user: doc, status: "OK" });
    } else {
      res.json({ status: "No user found with id : " + req.params.id });
    }
  });
});

// Delete User
app.delete("/api/users/:id", (req, res) => {
  console.log("delete team", req.params.id);
  const userId = req.params.id;
  User.deleteOne({ _id: userId }).then((data) => {
    console.log(data);
    if (data.deletedCount == 1) {
      res.json({ status: "DELETED" });
    } else {
      res.json({ status: "No User found with id : " + req.params.id });
    }
  });
});

// Create new course
app.post("/api/courses", (req, res) => {
  console.log("create player", req.body);
  User.findOne({ _id: req.body.teacherId }).then((teacher) => {
    if (!teacher) {
      res.json({ status: "Teacher not found" });
    } else {
      const newCourse = new Course({
        name: req.body.name,
        teacherId: teacher._id,
        description: req.body.description,
        duration: req.body.duration,
      });
      newCourse.save((err, doc) => {
        if (err) {
          res.json({ status: "Error creating Course" });
        } else {
          res.json({ status: "OK" });
        }
      });
    }
  });
});

// Get all courses
app.get("/api/courses", (req, res) => {
  console.log("get all courses");
  Course.find()
    .populate("teacherId")
    .populate("students")
    .then((C) => {
      res.json({ tab: C, status: "OK" });
    });
});

// get Course by id
app.get("/api/courses/:id", (req, res) => {
  console.log("get course by id", req.params.id);
  Course.findById(req.params.id)
    .populate("students")
    .then((doc) => {
      if (doc) {
        res.json({ course: doc, status: "OK" });
      } else {
        res.json({ status: "No course found with id : " + req.params.id });
      }
    });
});

// update Course
app.put("/api/courses", (req, res) => {
  console.log("update Course", req.body);
  let newCourse = req.body;
  Course.updateOne({ _id: newCourse._id }, newCourse).then((updated) => {
    console.log("Here update response", updated);
    updated.nModified == 1
      ? res.json({ msg: "Updated" })
      : res.json({ msg: "not" });
  });
});

// delete Course
app.delete("/api/courses/:id", (req, res) => {
  console.log("delete course", req.params.id);
  const courseId = req.params.id;
  // find Course to delete
  Course.deleteOne({ _id: courseId }).then((data) => {
    console.log(data);
    if (data.deletedCount == 1) {
      res.json({ status: "DELETED" });
    } else {
      res.json({ status: "No course found with id : " + req.params.id });
    }
  });
});

// add grade
app.put("/api/courses/:id/add-grade", async (req, res) => {
  const courseId = req.params.id;
  const { studentId, mark, evaluation } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ status: "COURSE_NOT_FOUND" });

    // Supprimer ancienne note s’il en existe déjà une pour cet étudiant
    course.grades = course.grades.filter(
      (g) => g.studentId.toString() !== studentId
    );

    // Ajouter la nouvelle note
    course.grades.push({ studentId, mark, evaluation });

    await course.save();

    res.json({ status: "GRADE_ADDED", course });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.post("/api/users/parents/child-courses", async (req, res) => {
  const { childPhone } = req.body;

  try {
    const child = await User.findOne({
      telephone: childPhone,
      role: "student",
    });
    if (!child) {
      return res.status(404).json({ status: "CHILD_NOT_FOUND" });
    }

    const courses = await Course.find({ students: child._id })
      .populate("teacherId", "firstName lastName") // juste le nom du prof
      .lean();

    // Ajouter la note et l’évaluation de ce student dans chaque course
    courses.forEach((course) => {
      const grade = course.grades.find(
        (g) => g.studentId.toString() === child._id.toString()
      );
      course.childMark = grade?.mark || null;
      course.childEvaluation = grade?.evaluation || null;
    });

    res.json({ status: "OK", courses });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: error.message });
  }
});

module.exports = app;
