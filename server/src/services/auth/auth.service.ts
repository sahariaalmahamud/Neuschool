import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { signAccessToken } from "../../lib/jwt.js";
import {
  validateAndNormalizeRegisterInput,
  validateAndNormalizeLoginInput,
} from "../../utils/validation.js";
import type {
  AuthResponseData,
  SafeUser,
} from "../../types/auth.types.js";
import type { CustomError } from "../../middlewares/error.middleware.js";

const SALT_ROUNDS = 10;

export const registerUserService = async (
  rawInput: unknown
): Promise<AuthResponseData> => {
  const { name, email, password } = validateAndNormalizeRegisterInput(rawInput);

  // Check duplicate user email
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    const err: CustomError = new Error("Email address is already registered");
    err.statusCode = 409;
    throw err;
  }

  // Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Force public registration role strictly to STUDENT
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const safeUser: SafeUser = createdUser;
  const accessToken = signAccessToken({
    userId: safeUser.id,
    role: safeUser.role,
  });

  return {
    user: safeUser,
    accessToken,
  };
};

export const loginUserService = async (
  rawInput: unknown
): Promise<AuthResponseData> => {
  const { email, password } = validateAndNormalizeLoginInput(rawInput);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const err: CustomError = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const err: CustomError = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const accessToken = signAccessToken({
    userId: safeUser.id,
    role: safeUser.role,
  });

  return {
    user: safeUser,
    accessToken,
  };
};

export const getAuthenticatedUserService = async (
  userId: string
): Promise<SafeUser> => {
  if (!userId || typeof userId !== "string") {
    const err: CustomError = new Error("Invalid user ID");
    err.statusCode = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const err: CustomError = new Error("Authenticated user no longer exists");
    err.statusCode = 404;
    throw err;
  }

  return user;
};
