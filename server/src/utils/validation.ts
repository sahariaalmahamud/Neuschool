import type { RegisterInput, LoginInput } from "../types/auth.types.js";
import type { CourseLevel, LessonType } from "@prisma/client";
import type { CustomError } from "../middlewares/error.middleware.js";
import { VALID_COURSE_LEVELS } from "../types/course.types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createValidationError = (message: string): CustomError => {
  const err: CustomError = new Error(message);
  err.statusCode = 400;
  return err;
};

export const validateAndNormalizeRegisterInput = (body: unknown): RegisterInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { name, email, password } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw createValidationError("Name is required");
  }

  if (name.trim().length < 2 || name.trim().length > 100) {
    throw createValidationError("Name must be between 2 and 100 characters");
  }

  if (typeof email !== "string" || email.trim().length === 0) {
    throw createValidationError("Email address is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createValidationError("Please provide a valid email address");
  }

  if (typeof password !== "string" || password.length === 0) {
    throw createValidationError("Password is required");
  }

  if (password.length < 6) {
    throw createValidationError("Password must be at least 6 characters long");
  }

  if (password.length > 128) {
    throw createValidationError("Password cannot exceed 128 characters");
  }

  return {
    name: name.trim(),
    email: normalizedEmail,
    password,
  };
};

export const validateAndNormalizeLoginInput = (body: unknown): LoginInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || email.trim().length === 0) {
    throw createValidationError("Email address is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createValidationError("Please provide a valid email address");
  }

  if (typeof password !== "string" || password.length === 0) {
    throw createValidationError("Password is required");
  }

  return {
    email: normalizedEmail,
    password,
  };
};

export interface CreateCourseInput {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  thumbnail?: string;
  level: CourseLevel;
  categoryId: string;
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  thumbnail?: string;
  level?: CourseLevel;
  categoryId?: string;
}

export const validateCreateCourseInput = (body: unknown): CreateCourseInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, slug, description, shortDescription, price, thumbnail, level, categoryId } =
    body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length < 3) {
    throw createValidationError("Title is required and must be at least 3 characters long");
  }

  if (title.trim().length > 150) {
    throw createValidationError("Title cannot exceed 150 characters");
  }

  if (typeof slug !== "string" || slug.trim().length === 0) {
    throw createValidationError("Slug is required");
  }

  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalizedSlug.length === 0) {
    throw createValidationError("Slug contains invalid characters");
  }

  if (typeof description !== "string" || description.trim().length < 10) {
    throw createValidationError("Description is required and must be at least 10 characters long");
  }

  let numPrice = 0;
  if (price !== undefined) {
    numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw createValidationError("Price must be a valid non-negative number");
    }
  }

  if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
    throw createValidationError("categoryId is required");
  }

  let courseLevel: CourseLevel = "BEGINNER";
  if (level !== undefined && typeof level === "string") {
    const upperLevel = level.trim().toUpperCase() as CourseLevel;
    if (!VALID_COURSE_LEVELS.includes(upperLevel)) {
      throw createValidationError(
        `Invalid level. Allowed values: ${VALID_COURSE_LEVELS.join(", ")}`
      );
    }
    courseLevel = upperLevel;
  }

  return {
    title: title.trim(),
    slug: normalizedSlug,
    description: description.trim(),
    shortDescription: typeof shortDescription === "string" ? shortDescription.trim() : undefined,
    price: numPrice,
    thumbnail: typeof thumbnail === "string" ? thumbnail.trim() : undefined,
    level: courseLevel,
    categoryId: categoryId.trim(),
  };
};

export const validateUpdateCourseInput = (body: unknown): UpdateCourseInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, slug, description, shortDescription, price, thumbnail, level, categoryId } =
    body as Record<string, unknown>;

  const updates: UpdateCourseInput = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw createValidationError("Title must be at least 3 characters long");
    }
    if (title.trim().length > 150) {
      throw createValidationError("Title cannot exceed 150 characters");
    }
    updates.title = title.trim();
  }

  if (slug !== undefined) {
    if (typeof slug !== "string" || slug.trim().length === 0) {
      throw createValidationError("Slug cannot be empty");
    }
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (normalizedSlug.length === 0) {
      throw createValidationError("Slug contains invalid characters");
    }
    updates.slug = normalizedSlug;
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10) {
      throw createValidationError("Description must be at least 10 characters long");
    }
    updates.description = description.trim();
  }

  if (shortDescription !== undefined) {
    updates.shortDescription = typeof shortDescription === "string" ? shortDescription.trim() : undefined;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw createValidationError("Price must be a valid non-negative number");
    }
    updates.price = numPrice;
  }

  if (thumbnail !== undefined) {
    updates.thumbnail = typeof thumbnail === "string" ? thumbnail.trim() : undefined;
  }

  if (level !== undefined && typeof level === "string") {
    const upperLevel = level.trim().toUpperCase() as CourseLevel;
    if (!VALID_COURSE_LEVELS.includes(upperLevel)) {
      throw createValidationError(
        `Invalid level. Allowed values: ${VALID_COURSE_LEVELS.join(", ")}`
      );
    }
    updates.level = upperLevel;
  }

  if (categoryId !== undefined) {
    if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
      throw createValidationError("categoryId cannot be empty");
    }
    updates.categoryId = categoryId.trim();
  }

  return updates;
};

// --- MODULE VALIDATORS ---

export interface CreateModuleInput {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  order?: number;
}

export const validateCreateModuleInput = (body: unknown): CreateModuleInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, description, order } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length < 2) {
    throw createValidationError("Module title is required and must be at least 2 characters long");
  }

  if (title.trim().length > 150) {
    throw createValidationError("Module title cannot exceed 150 characters");
  }

  let orderNum = 1;
  if (order !== undefined) {
    orderNum = Number(order);
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      throw createValidationError("Module order must be a positive integer greater than or equal to 1");
    }
  }

  return {
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : undefined,
    order: orderNum,
  };
};

export const validateUpdateModuleInput = (body: unknown): UpdateModuleInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, description, order } = body as Record<string, unknown>;
  const updates: UpdateModuleInput = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 2) {
      throw createValidationError("Module title must be at least 2 characters long");
    }
    if (title.trim().length > 150) {
      throw createValidationError("Module title cannot exceed 150 characters");
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = typeof description === "string" ? description.trim() : undefined;
  }

  if (order !== undefined) {
    const orderNum = Number(order);
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      throw createValidationError("Module order must be a positive integer greater than or equal to 1");
    }
    updates.order = orderNum;
  }

  return updates;
};

// --- LESSON VALIDATORS ---

export interface CreateLessonInput {
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  order: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  type?: LessonType;
  content?: string;
  videoUrl?: string;
  order?: number;
}

export const validateCreateLessonInput = (body: unknown): CreateLessonInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, description, type, content, videoUrl, order } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length < 2) {
    throw createValidationError("Lesson title is required and must be at least 2 characters long");
  }

  if (title.trim().length > 150) {
    throw createValidationError("Lesson title cannot exceed 150 characters");
  }

  if (typeof type !== "string" || !["VIDEO", "TEXT"].includes(type.trim().toUpperCase())) {
    throw createValidationError("Lesson type is required and must be either VIDEO or TEXT");
  }

  const lessonType = type.trim().toUpperCase() as LessonType;

  if (lessonType === "TEXT") {
    if (typeof content !== "string" || content.trim().length === 0) {
      throw createValidationError("Content is required for TEXT type lessons");
    }
  }

  if (lessonType === "VIDEO") {
    if (typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
      throw createValidationError("videoUrl is required for VIDEO type lessons");
    }
  }

  let orderNum = 1;
  if (order !== undefined) {
    orderNum = Number(order);
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      throw createValidationError("Lesson order must be a positive integer greater than or equal to 1");
    }
  }

  return {
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : undefined,
    type: lessonType,
    content: typeof content === "string" ? content.trim() : undefined,
    videoUrl: typeof videoUrl === "string" ? videoUrl.trim() : undefined,
    order: orderNum,
  };
};

export const validateUpdateLessonInput = (body: unknown): UpdateLessonInput => {
  if (!body || typeof body !== "object") {
    throw createValidationError("Invalid request payload");
  }

  const { title, description, type, content, videoUrl, order } = body as Record<string, unknown>;
  const updates: UpdateLessonInput = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 2) {
      throw createValidationError("Lesson title must be at least 2 characters long");
    }
    if (title.trim().length > 150) {
      throw createValidationError("Lesson title cannot exceed 150 characters");
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = typeof description === "string" ? description.trim() : undefined;
  }

  let targetType: LessonType | undefined = undefined;
  if (type !== undefined) {
    if (typeof type !== "string" || !["VIDEO", "TEXT"].includes(type.trim().toUpperCase())) {
      throw createValidationError("Lesson type must be either VIDEO or TEXT");
    }
    targetType = type.trim().toUpperCase() as LessonType;
    updates.type = targetType;
  }

  if (content !== undefined) {
    updates.content = typeof content === "string" ? content.trim() : undefined;
  }

  if (videoUrl !== undefined) {
    updates.videoUrl = typeof videoUrl === "string" ? videoUrl.trim() : undefined;
  }

  if (order !== undefined) {
    const orderNum = Number(order);
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      throw createValidationError("Lesson order must be a positive integer greater than or equal to 1");
    }
    updates.order = orderNum;
  }

  return updates;
};
