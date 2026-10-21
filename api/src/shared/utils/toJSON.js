export const toJSONOptions = (hiddenFields = []) => ({
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    for (const field of hiddenFields) delete ret[field];
    return ret;
  },
});
