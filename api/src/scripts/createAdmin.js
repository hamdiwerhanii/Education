import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../db/connect.js";
import { strongPassword, telephone } from "../modules/auth/auth.schemas.js";
import { BCRYPT_ROUNDS } from "../modules/auth/auth.service.js";
import { ROLES } from "../modules/users/user.constants.js";
import { User } from "../modules/users/user.model.js";

const USAGE =
  'Usage: npm run create-admin -- --first-name Amira --last-name Admin --email admin@school.tn --telephone 12345678 --password "Str0ng@Pass"';

const argsSchema = z.object({
  "first-name": z.string().trim().min(2),
  "last-name": z.string().trim().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  telephone,
  password: strongPassword,
});

const { values } = parseArgs({
  options: {
    "first-name": { type: "string" },
    "last-name": { type: "string" },
    email: { type: "string" },
    telephone: { type: "string" },
    password: { type: "string" },
  },
});

const parsed = argsSchema.safeParse(values);
if (!parsed.success) {
  console.error(parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n"));
  console.error(USAGE);
  process.exit(1);
}

const data = parsed.data;
await connectDatabase(env.MONGODB_URI);

try {
  const existing = await User.findOne({ $or: [{ email: data.email }, { telephone: data.telephone }] }).lean();
  if (existing) throw new Error("A user with this email or telephone already exists");

  await User.create({
    firstName: data["first-name"],
    lastName: data["last-name"],
    email: data.email,
    telephone: data.telephone,
    passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
    role: ROLES.ADMIN,
  });
  console.log(`Admin ${data.email} created. Log in with telephone ${data.telephone}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
