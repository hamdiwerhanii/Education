import { z } from "zod";
import { badRequest } from "../utils/AppError.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const { fieldErrors, formErrors } = z.flattenError(result.error);
    return next(badRequest(formErrors[0] ?? "Please check the highlighted fields", fieldErrors));
  }

  req.validated = { ...req.validated, [source]: result.data };
  next();
};
