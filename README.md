# Education

A full-stack school management platform where admins, teachers, students and parents manage courses, enrolment requests and grades, each from their own space.

![Angular](https://img.shields.io/badge/Angular-14-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_5-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Project Status and Known Limitations](#project-status-and-known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

**Education** is a MEAN-stack application (MongoDB, Express, Angular, Node.js) for running a small school or training centre online. It has four user roles, and each one gets its own workflow:

| Role | What they can do |
|------|------------------|
| **Admin** | Manage every user, validate teacher accounts, accept students' course-join requests, delete users |
| **Teacher** | Create, edit and delete their own courses, see enrolled students, and give each student a mark and a written evaluation |
| **Student** | Browse courses, ask to join a course, and see their enrolled courses with their personal grade |
| **Parent** | Link their children's phone numbers at sign-up and view each child's courses, marks and evaluations |

The project covers the full stack: role-based sign-up with file uploads, JWT login, an approval workflow for teachers and for enrolments, relational data in MongoDB using `populate`, and a multi-dashboard Angular front end.

## Features

### Authentication and accounts
- Separate sign-up forms per role (`/signUpAdmin`, `/signUpTeacher`, `/signUpStudent`, `/signUpParent`) built from a single reactive-form component
- Client-side validation: required fields, valid email, 8-digit phone number, and a **strong password** rule (8 to 20 characters with uppercase, lowercase, digit and special character) plus a password-confirmation match
- Server-side **duplicate checks** on email and telephone, with field-specific error messages
- Passwords hashed with **bcrypt** (12 salt rounds)
- **Login with phone number and password**. The server returns a signed JWT (1-hour expiry), which is stored in `sessionStorage` and decoded on the client with `jwt-decode`
- Redirect after login based on role, plus a navigation bar that changes with the role
- **Teacher approval:** a teacher cannot log in until an admin validates the account. Admin accounts are approved automatically

### File uploads
- Profile photo upload for every role, and CV upload (PDF) for teachers, handled by **Multer**
- Accepted MIME types: PNG, JPEG/JPG, WEBP and PDF
- Files are stored in `backend/files/photos` and `backend/files/cvs` and served statically at `/files/...`

### Courses
- Teachers create courses (name, description, duration) from their dashboard
- Public course catalogue and course detail page
- Teacher dashboard lists only the logged-in teacher's courses, with edit and delete actions
- Students can send a **join request** from a course detail page. The request stays pending until an admin accepts it

### Grades and evaluations
- Teachers pick an enrolled student and record a numeric **mark** and a text **evaluation**. If the student already has a grade, the new one replaces it
- Students see their grade for each enrolled course in the student dashboard
- Parents enter a child's phone number and get that child's courses, teacher names, marks and evaluations. The lookup only works for phone numbers registered on the parent's account. At sign-up, each child phone number must belong to an existing student

### Admin dashboard
- Users table showing every non-admin user, with **Validate** (pending teachers), **Delete**, user details, and **Accept** for students' pending course requests

### Public site
- Landing page with hero banner, about section, subjects, course list and teacher list
- Teachers page with a custom `filter` pipe that searches teachers by speciality
- SweetAlert2 dialogs for feedback (sign-up success, login, access denied, request sent)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Front end | Angular 14, TypeScript 4.7, RxJS 7, Angular Reactive and Template-driven Forms, Angular Router, HttpClient |
| UI | Bootstrap 5, a bundled HTML education theme (jQuery plugins, Owl Carousel, Slick, Font Awesome, Themify and Flaticon icons), SweetAlert2 |
| Back end | Node.js, Express 4, body-parser, express-session |
| Database | MongoDB with Mongoose 5 |
| Auth and security | jsonwebtoken (signing), jwt-decode (client), bcrypt (password hashing) |
| File handling | Multer (disk storage) |
| Testing scaffold | Karma and Jasmine (default Angular CLI spec files) |

## Architecture

```
┌─────────────────────────┐   HTTP (JSON / multipart)   ┌──────────────────────────┐
│ Angular 14 SPA          │ ──────────────────────────► │ Express API (port 4000)  │
│ http://localhost:4200   │                             │ server.js → backend/app  │
│ User & Course services  │ ◄────────────────────────── │ JWT · bcrypt · Multer    │
└─────────────────────────┘        JWT in response      └────────────┬─────────────┘
                                                                     │ Mongoose
                                                        ┌────────────▼─────────────┐
                                                        │ MongoDB  educationDB     │
                                                        │ users · courses          │
                                                        └──────────────────────────┘
```

The front end and back end are in the same repository and share one `package.json`. The Angular app calls the API through two services (`UserService`, `CourseService`), and both have `http://localhost:4000/api/...` hard-coded as the base URL.

## Project Structure

```
Education/
├── server.js                      # Starts the Express API on port 4000
├── backend/
│   ├── app.js                     # Express app: middleware, Multer config, all API routes
│   ├── models/
│   │   ├── User.js                # User schema (admin / teacher / student / parent)
│   │   └── Course.js              # Course schema with students[] and grades[]
│   └── files/
│       ├── photos/                # Uploaded profile pictures
│       └── cvs/                   # Uploaded teacher CVs (PDF)
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── environments/
│   ├── assets/                    # Theme CSS/SCSS, JS plugins, fonts, images, login video
│   └── app/
│       ├── app.module.ts
│       ├── app-routing.module.ts
│       ├── services/
│       │   ├── user.service.ts    # Sign-up, login, users, join requests, child courses
│       │   └── course.service.ts  # Course CRUD and grading
│       ├── pipes/
│       │   └── filter.pipe.ts     # Filters teachers by speciality
│       ├── validators/
│       │   └── validatorPass.ts   # Strong-password and password-match validators
│       └── components/
│           ├── home/ banner-home/ banner/ about/ subjects/ header/ footer/
│           ├── courses/ course/ course-info/ teachers/ teacher/
│           ├── sign-up/ login/ user-info/
│           ├── teacher-dashboard/ dashboard-home/ add-course/ edit-course/
│           ├── admin-dashboard/ dashboard-admin-home/ users-table/ courses-table/
│           ├── student-dashboard/
│           └── parent-eval-child/
├── angular.json
├── karma.conf.js
├── package.json
└── tsconfig*.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (an LTS version that works with Angular 14, for example Node 16 or 18) and npm
- [Angular CLI 14](https://angular.io/cli): `npm install -g @angular/cli@14` (optional, because `npm start` uses the local CLI)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on the default port `27017`

### 1. Clone and install

```bash
git clone https://github.com/hamdiwerhanii/Education.git
cd Education
npm install
```

### 2. Configuration

The project has no `.env` file. All configuration is hard-coded:

| Setting | Location | Current value |
|---------|----------|---------------|
| MongoDB connection string | `backend/app.js` | `mongodb://127.0.0.1:27017/educationDB` |
| JWT and session secret | `backend/app.js` (`secretKey`) | `your-secret-key` (placeholder; change it before any real use) |
| API port | `server.js` | `4000` |
| API base URL (front end) | `src/app/services/*.service.ts` | `http://localhost:4000/api/...` |
| Uploaded-file base URL | `backend/app.js` | `http://localhost:4000/files/...` |

MongoDB creates the `educationDB` database automatically the first time data is written.

### 3. Run the back end

Run this from the project root, because Multer upload paths are relative to the root:

```bash
node server.js
```

The API listens on `http://localhost:4000`.

### 4. Run the front end

In a second terminal:

```bash
npm start        # runs ng serve
```

Open `http://localhost:4200`.

### Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve` | Starts the Angular dev server |
| `npm run build` | `ng build` | Builds the front end into `dist/` |
| `npm run watch` | `ng build --watch --configuration development` | Rebuilds the front end whenever files change |
| `npm test` | `ng test` | Runs the Karma/Jasmine unit tests (default CLI-generated specs only) |

The back end has no npm script. Start it with `node server.js`.

### First steps after launch

1. Go to `/signUpAdmin` and create an admin account. Admins are approved automatically.
2. Register a teacher at `/signUpTeacher`, then log in as the admin and **validate** that teacher in the admin dashboard.
3. Log in as the teacher and create courses under **Teacher Dashboard → Add Course**.
4. Register a student at `/signUpStudent`, open a course and send a join request. Then accept it as the admin.
5. As the teacher, grade the student. Register a parent at `/signUpParent` using the student's phone number to follow that student's results.

## Application Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `HomeComponent` | Landing page (banner, about, subjects, courses, teachers) |
| `/courses` | `CoursesComponent` | Course catalogue |
| `/courseInfo/:id` | `CourseInfoComponent` | Course details and the join-request button |
| `/teachers` | `TeachersComponent` | Teacher list with search by speciality |
| `/signUpAdmin`, `/signUpTeacher`, `/signUpStudent`, `/signUpParent` | `SignUpComponent` | Sign-up form for each role |
| `/login` | `LoginComponent` | Phone and password login |
| `/userInfo/:id` | `UserInfoComponent` | User profile details |
| `/studentDashboard` | `StudentDashboardComponent` | Enrolled courses and personal grades |
| `/childsEvaluation` | `ParentEvalChildComponent` | Parent view of a child's courses and grades |
| `/teacherDashboard/home` | `DashboardHomeComponent` | Teacher's courses, students and grading |
| `/teacherDashboard/addCourse` | `AddCourseComponent` | Create a course |
| `/teacherDashboard/editCourse/:id` | `EditCourseComponent` | Edit a course |
| `/dashboardAdmin/home` | `DashboardAdminHomeComponent` | Admin users/courses tabs |
| `/dashboardAdmin/editCourse/:id` | `EditCourseComponent` | Edit a course (admin) |

## API Reference

Base URL: `http://localhost:4000`

None of the endpoints check the JWT on the server. "Intended role" shows which role uses each endpoint in the UI. It is not enforced.

### Users

| Method | Path | Description | Intended role |
|--------|------|-------------|---------------|
| `POST` | `/api/users` | Sign up (multipart: user fields plus optional `img` and `cv` files; `childTelephones` as a JSON array for parents) | Public |
| `POST` | `/api/users/login` | Log in with `{ telephone, password }` and get `{ status, user: <JWT> }` back | Public |
| `GET` | `/api/users` | List all users | Admin, public pages |
| `GET` | `/api/users/:id` | Get one user | Any |
| `DELETE` | `/api/users/:id` | Delete a user | Admin |
| `PUT` | `/api/users/validate` | Validate a teacher account `{ userId }` | Admin |
| `POST` | `/api/users/join-request` | Request to join a course `{ studentId, courseId }` | Student |
| `PUT` | `/api/users/accept-course-request` | Accept a join request `{ studentId, courseId }` | Admin |
| `POST` | `/api/users/parents/child-courses` | Get a child's courses with mark and evaluation `{ childPhone }` | Parent |

### Courses

| Method | Path | Description | Intended role |
|--------|------|-------------|---------------|
| `GET` | `/api/courses` | List all courses (teacher and students populated) | Any |
| `GET` | `/api/courses/:id` | Get one course (students populated) | Any |
| `POST` | `/api/courses` | Create a course `{ name, description, duration, teacherId }` | Teacher |
| `PUT` | `/api/courses` | Update a course (body must include `_id`) | Teacher, Admin |
| `DELETE` | `/api/courses/:id` | Delete a course | Teacher |
| `PUT` | `/api/courses/:id/add-grade` | Add or replace a student's grade `{ studentId, mark, evaluation }` | Teacher |

### Static files

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/files/photos/<file>` | Uploaded profile photos |
| `GET` | `/files/cvs/<file>` | Uploaded teacher CVs |

## Data Models

**User** (`backend/models/User.js`)

| Field | Type | Notes |
|-------|------|-------|
| `firstName`, `lastName` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required, bcrypt hash |
| `telephone` | Number | Required, unique; used as the login identifier |
| `role` | String | `admin` · `teacher` · `student` · `parent` |
| `address`, `speciality` | String | `speciality` is used for teachers |
| `childTelephones` | [Number] | Required for parents |
| `success` | Boolean | Account validated; defaults to `false` |
| `photo`, `cv` | String | URLs of uploaded files |
| `requestedCourseIds` | [ObjectId → Course] | Pending join requests |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

**Course** (`backend/models/Course.js`)

| Field | Type | Notes |
|-------|------|-------|
| `name`, `description`, `duration` | String | Required |
| `teacherId` | ObjectId → User | Required |
| `students` | [ObjectId → User] | Enrolled students |
| `grades` | [{ `studentId`, `mark`, `evaluation` }] | One entry per student |

## Project Status and Known Limitations

This is a learning and portfolio project. The main workflows work end to end, but some parts are unfinished:

- **No server-side authorization.** The API does not verify the JWT, so the role restrictions exist only in the UI.
- **Hard-coded configuration.** The JWT secret, database URI, ports and URLs are written into the code instead of being read from environment variables.
- **Placeholder components:** `courses-table` (the admin "Courses" tab), `course-table` and `dashboard-admin-add-course` are still generated stubs.
- `UserService.updateUser()` calls `PUT /api/users/:id`, but the back end has no such endpoint.
- In the users table, the Validate action checks for the status `"OK "` (with a trailing space), so the list does not refresh after a teacher is validated. Reloading the page shows the new state.
- After a teacher deletes a course, the dashboard reloads **all** courses instead of only that teacher's courses.
- The admin users table can only accept a student's **first** pending course request.
- Sample uploaded files are committed under `backend/files/`.
- Unit tests are the default Angular CLI specs. No real test suite has been written.

## Roadmap

- [ ] Add JWT-verification and role-based authorization middleware to the Express API
- [ ] Move secrets and URLs to environment variables (`.env` on the back end, Angular `environment.ts` on the front end)
- [ ] Add Angular route guards for the role dashboards
- [ ] Finish the admin courses table and a profile-editing endpoint
- [ ] Split the back-end routes into separate router and controller modules
- [ ] Add an npm script (e.g. with `concurrently`) to start the API and the client together
- [ ] Write meaningful unit and API tests

## Contributing

Contributions, issues and suggestions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

No license file is currently included; all rights reserved by the author.

## Author

**Hamdi Werhani**
GitHub: [@hamdiwerhanii](https://github.com/hamdiwerhanii)
