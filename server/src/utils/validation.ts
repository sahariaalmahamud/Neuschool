import type { RegisterInput, LoginInput } from "../types/auth.types.js";
import type { CustomError } from "../middlewares/error.middleware.js";

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
