export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, message, details);
export const unauthorized = (message = "Please log in to continue") => new AppError(401, message);
export const forbidden = (message = "You are not allowed to do that") => new AppError(403, message);
export const notFound = (what = "Resource") => new AppError(404, `${what} not found`);
export const conflict = (message, details) => new AppError(409, message, details);
