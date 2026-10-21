import bcrypt from "bcryptjs";
import { badRequest, conflict, forbidden, unauthorized } from "../../shared/utils/AppError.js";
import { ROLES } from "../users/user.constants.js";
import { User } from "../users/user.model.js";

export const BCRYPT_ROUNDS = 12;
const INVALID_CREDENTIALS = "Invalid telephone or password";
const TIMING_SAFE_HASH = bcrypt.hashSync("timing-safe-placeholder", BCRYPT_ROUNDS);

async function assertUnique({ email, telephone }) {
  const existing = await User.find({ $or: [{ email }, { telephone }] }, "email telephone").lean();
  const details = {};
  if (existing.some((user) => user.email === email)) details.email = ["This email is already in use"];
  if (existing.some((user) => user.telephone === telephone)) details.telephone = ["This telephone is already in use"];
  if (Object.keys(details).length) throw conflict("Some details are already in use", details);
}

async function resolveChildren(childTelephones) {
  const unique = [...new Set(childTelephones)];
  const students = await User.find({ telephone: { $in: unique }, role: ROLES.STUDENT }, "_id telephone").lean();
  const found = new Set(students.map((student) => student.telephone));
  const missing = unique.filter((phone) => !found.has(phone));
  if (missing.length) {
    throw badRequest("No student account uses one of these telephones", {
      childTelephones: [`No student found for: ${missing.join(", ")}`],
    });
  }
  return students.map((student) => student._id);
}

export async function registerUser(data, files) {
  await assertUnique(data);

  const children = data.role === ROLES.PARENT ? await resolveChildren(data.childTelephones) : [];
  const isTeacher = data.role === ROLES.TEACHER;

  return User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    telephone: data.telephone,
    passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
    role: data.role,
    isApproved: !isTeacher,
    address: data.address,
    speciality: isTeacher ? data.speciality : "",
    photo: files.photo,
    cv: isTeacher ? files.cv : "",
    children,
  });
}

export async function authenticate({ telephone, password }) {
  const user = await User.findOne({ telephone }).select("+passwordHash");
  const matches = await bcrypt.compare(password, user?.passwordHash ?? TIMING_SAFE_HASH);
  if (!user || !matches) throw unauthorized(INVALID_CREDENTIALS);
  if (!user.isApproved) throw forbidden("Your account is waiting for admin approval");
  return user;
}
