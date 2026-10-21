# Education — School Management Platform

A full-stack learning platform built with **MongoDB, Express, Angular and Node.js (MEAN)**. Teachers publish courses, students ask to join and receive marks with feedback, parents follow their children's results, and admins approve teachers and manage the platform.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Roles and Permissions](#roles-and-permissions)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Security](#security)
- [Testing and Quality](#testing-and-quality)
- [Production Build](#production-build)
- [Roadmap](#roadmap)
- [License](#license)
- [Author](#author)

---

## Features

- **Public site**: home page with featured courses, subjects and teachers; searchable course and teacher lists with "load more"; course and teacher profile pages
- **Accounts**: sign up as a student, teacher or parent with photo upload (and a PDF CV for teachers); log in with telephone and password
- **Teacher approval**: new teachers stay pending until an admin approves them
- **Enrolment**: students ask to join a course, and the course teacher or an admin accepts or rejects the request
- **Grades**: teachers mark enrolled students out of 20 and leave written feedback
- **Parents**: link their account to their children's student accounts and follow their courses and marks
- **Admin dashboard**: statistics, user search and filters, teacher approval, CV download, enrolment requests and course management
- **Responsive theme** based on the Colorlib education template, with a keyboard-friendly mobile menu

## Roles and Permissions

Every rule below is enforced **by the API**, not only hidden in the interface.

| Action | Visitor | Student | Parent | Teacher | Admin |
| ------ | :-----: | :-----: | :----: | :-----: | :---: |
| Browse courses and teachers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ask to join / cancel a request | | ✅ | | | |
| See own courses and marks | | ✅ | | | |
| See children's courses and marks | | | ✅ | | |
| Create a course | | | | ✅ (approved) | |
| Edit, delete, accept requests, grade | | | | own courses | all courses |
| Approve teachers, delete users, read CVs | | | | | ✅ |

Admin accounts cannot be created from the website; they are created with a command (see [Getting Started](#getting-started)).

## Tech Stack

| Layer      | Technology |
| ---------- | ---------- |
| Front end  | **Angular 21** (standalone components, signals, zoneless change detection, new `@if` / `@for` control flow, reactive forms), Colorlib Bootstrap 4 theme (CSS only) |
| API        | **Express 5**, Zod, jsonwebtoken, bcryptjs, Helmet, express-rate-limit, Multer, cookie-parser |
| Database   | MongoDB with **Mongoose 9** |
| Tooling    | npm workspaces, concurrently, ESLint 10 + angular-eslint |
| Testing    | Vitest, Supertest, mongodb-memory-server, Angular TestBed, axe-core |
| CI         | GitHub Actions, Dependabot |

## Architecture

```
Browser ──► Angular dev server (:4200) ──► Angular app
                │
                └── /api, /uploads ──proxy──► Express API (:4000) ──► MongoDB
```

- In development the Angular dev server **proxies** API calls (`client/proxy.conf.json`), so the browser sees one origin and the session cookie works without CORS.
- In production, Express serves the built Angular app from `client/dist`, so the platform deploys as **one Node.js service**.
- The session is a signed **JWT in an `httpOnly` cookie**. Angular never reads the token; it asks `GET /api/auth/me` who is logged in, and visitors simply get `{ "user": null }`.

## Project Structure

```
Education/
├── .github/                          # CI workflow + Dependabot
├── api/
│   ├── __tests__/                    # Supertest + in-memory MongoDB tests
│   ├── src/
│   │   ├── config/env.js             # Environment variables validated with Zod
│   │   ├── modules/
│   │   │   ├── auth/                 # sign up, login, logout, me, JWT cookie
│   │   │   ├── courses/              # model, schemas, service, controller, routes
│   │   │   ├── teachers/             # public teacher list and profiles
│   │   │   ├── me/                   # dashboards: my courses, my children
│   │   │   ├── admin/                # users, approval, CVs, requests, stats
│   │   │   ├── uploads/              # Multer config, file type and content checks
│   │   │   └── users/                # user model and roles
│   │   ├── shared/                   # middleware (auth, validate, errors) and utils
│   │   ├── scripts/                  # seed data, seed, create-admin
│   │   ├── app.js / server.js / demo.js
│   └── .env.example
├── client/
│   ├── public/assets/                # theme CSS, fonts and images
│   ├── src/
│   │   ├── __tests__/                # unit, component and accessibility tests
│   │   └── app/
│   │       ├── modules/              # home, about, courses, teachers, auth, dashboard/*, not-found
│   │       ├── shared/               # components, services, guards, models, pipes, constants, utils
│   │       ├── app.routes.ts         # lazy-loaded routes with role guards
│   │       └── app.config.ts
│   ├── angular.json                  # dev proxy + security headers
│   └── proxy.conf.json
├── LICENSE
└── package.json                      # workspaces + root scripts
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or newer (24 LTS recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, **or** use demo mode

### Install

```bash
git clone https://github.com/hamdiwerhanii/Education.git
cd Education
npm install
```

### Option A: demo mode (no setup)

```bash
npm run dev:demo
```

Starts the API with a temporary **in-memory MongoDB** filled with sample users and courses, plus the Angular app. Open http://localhost:4200 and log in with any of these accounts (password `Demo@1234`):

| Telephone  | Role    | Notes |
| ---------- | ------- | ----- |
| `10000000` | Admin   | Full dashboard |
| `20000001` | Teacher | Owns two courses with students and a pending request |
| `20000004` | Teacher | Waiting for approval (login is refused) |
| `30000001` | Student | Enrolled in two courses, with marks |
| `40000001` | Parent  | Parent of two students |

### Option B: with your own MongoDB

```bash
cp api/.env.example api/.env        # then set a long random JWT_SECRET
npm run seed                        # optional: wipe the database and add the sample data
npm run create-admin -- --first-name Amira --last-name Admin --email admin@school.tn --telephone 12345678 --password "Str0ng@Pass"
npm run dev
```

### Scripts (from the repository root)

| Command | Description |
| ------- | ----------- |
| `npm run dev` | API (:4000, auto-restart) + Angular app (:4200) |
| `npm run dev:demo` | Same, with an in-memory database and sample data |
| `npm run seed` | Reset the database in `MONGODB_URI` to the sample data |
| `npm run create-admin -- ...` | Create an admin account |
| `npm run lint` | ESLint in both workspaces |
| `npm run test:unit` | API and client tests |
| `npm run build` | Production build of the Angular app |
| `npm start` | Start the API (serves the built app when `NODE_ENV=production`) |

## Environment Variables

**`api/.env`** (see `api/.env.example`)

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `NODE_ENV` | `development`, `test` or `production` | `development` |
| `PORT` | API port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/education` |
| `JWT_SECRET` | Secret that signs session tokens, **at least 32 characters** | required |
| `JWT_EXPIRES_IN` | Session lifetime | `7d` |
| `CLIENT_URL` | Public URL of the site | `http://localhost:4200` |
| `AUTH_RATE_LIMIT_MAX` | Failed logins, and sign-ups, allowed per IP every 15 minutes | `10` |
| `UPLOADS_DIR` | Where photos and CVs are stored | `api/uploads` |

## API Reference

Errors always have the shape `{ "error": { "message": "...", "details": { "field": ["..."] } } }`.

### Auth — `/api/auth`

| Method | Path | Access | Description |
| ------ | ---- | ------ | ----------- |
| POST | `/signup` | Public | Multipart form: `role` (student, teacher or parent), names, `email`, `telephone`, `password`, optional `photo`, teacher `speciality` and `cv`, parent `childTelephones` |
| POST | `/login` | Public | `telephone`, `password` |
| POST | `/logout` | Public | Clears the session cookie |
| GET | `/me` | Logged in | Current user |

### Courses — `/api/courses`

| Method | Path | Access | Description |
| ------ | ---- | ------ | ----------- |
| GET | `/` | Public | `page`, `limit` (max 30), `q` |
| GET | `/:id` | Public | Course + `viewer` status; owners and admins also get students, grades and requests |
| POST | `/` | Approved teacher | `name`, `description`, `durationMinutes` |
| PATCH | `/:id` | Owner / admin | Update any field |
| DELETE | `/:id` | Owner / admin | Delete |
| POST / DELETE | `/:id/join` | Student | Ask to join / cancel the request |
| POST | `/:id/requests/:studentId/accept` | Owner / admin | Accept a request |
| POST | `/:id/requests/:studentId/reject` | Owner / admin | Reject a request |
| PUT | `/:id/grades/:studentId` | Owner / admin | `mark` (0–20), `evaluation` |

### Other

| Method | Path | Access | Description |
| ------ | ---- | ------ | ----------- |
| GET | `/api/teachers`, `/api/teachers/:id` | Public | Approved teachers and their courses |
| GET | `/api/me/courses` | Teacher / student | Own courses (teachers) or enrolments, marks and pending requests (students) |
| GET | `/api/me/children` | Parent | Children with their courses and marks |
| GET | `/api/admin/stats`, `/api/admin/users`, `/api/admin/requests` | Admin | Statistics, users (`role`, `status`, `q` filters), pending requests |
| POST | `/api/admin/users/:id/approve` | Admin | Approve a teacher |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user (a teacher's courses are deleted too) |
| GET | `/api/admin/users/:id/cv` | Admin | Download a teacher's CV |
| GET | `/api/health` | Public | `{ "status": "ok" }` |

## Security

- **No public admin sign-up**: admins are created only with `npm run create-admin`.
- **Authorization on every route**: the API checks the session and the role (and course ownership) before every change.
- **Passwords** are hashed with bcrypt (12 rounds) and never returned; login takes the same time and returns the same message for an unknown telephone or a wrong password.
- **Sessions** use a signed JWT in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production).
- **Validation** of every body and query string with Zod; unknown fields are ignored.
- **Uploads**: only PNG, JPG and WEBP photos (2 MB) and PDF CVs (5 MB), checked by MIME type **and** file signature, stored under random names. CVs are private and served only to admins.
- **Privacy**: public pages show teachers' names, specialities and photos only; course pages show student counts, not student details.
- **Rate limiting** on failed logins and on sign-ups, **Helmet** security headers on the API, and the same headers on the Angular dev server.

## Testing and Quality

| Workspace | What the tests cover |
| --------- | -------------------- |
| `api` | Sign-up per role (admin refused, teacher pending, parent linked to children), strong passwords, upload content checks, login, sessions, course permissions, the request → accept → grade flow, mark limits, parent privacy, admin actions and cascades, CV access, security headers |
| `client` | Validators, API error handling, route guards, header and mobile menu, login and sign-up forms, and an axe-core accessibility scan of the header, footer, forms and 404 page |

```bash
npm run test:unit
```

The CI workflow runs lint, all tests and the production build on every push to `main` and every pull request. Dependabot opens weekly update pull requests.

## Production Build

```bash
npm run build
NODE_ENV=production npm start     # or set NODE_ENV=production in api/.env
```

Express then serves the Angular app, the API and uploaded photos from the same port. Set `MONGODB_URI`, `CLIENT_URL` and a strong `JWT_SECRET` on the server.

## Roadmap

- Email notifications when a teacher is approved or a request is accepted
- Profile editing and password change
- Course images uploaded by teachers
- Deploy and add a live demo link

## License

Code released under the [MIT License](LICENSE). The visual theme is based on a [Colorlib](https://colorlib.com) template licensed under CC BY 3.0, which requires the credit link kept in the footer.

## Author

**Hamdi Werhani** — GitHub [@hamdiwerhanii](https://github.com/hamdiwerhanii)
