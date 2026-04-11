export const validateTitle = (title) => {
  if (typeof title !== "string") {
    return "title must be a string";
  }

  if (!title.trim()) {
    return "title is required";
  }

  if (title.trim().length > 120) {
    return "title must be 120 characters or less";
  }

  return null;
};

export const validatePatchBody = (body) => {
  const hasCompleted = Object.hasOwn(body, "completed");
  const hasTitle = Object.hasOwn(body, "title");

  if (!hasCompleted && !hasTitle) {
    return "provide at least one field: completed or title";
  }

  if (hasCompleted && typeof body.completed !== "boolean") {
    return "completed must be a boolean";
  }

  if (hasTitle) {
    const titleError = validateTitle(body.title);
    if (titleError) {
      return titleError;
    }
  }

  return null;
};
