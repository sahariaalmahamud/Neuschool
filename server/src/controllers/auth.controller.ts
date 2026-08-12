import type { Request, Response, NextFunction } from "express";
import {
  registerUserService,
  loginUserService,
  getAuthenticatedUserService,
} from "../services/auth/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerUserService(req.body);
    sendSuccess(res, result, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginUserService(req.body);
    sendSuccess(res, result, "Authentication successful");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const user = await getAuthenticatedUserService(userId);
    sendSuccess(res, user, "Authenticated user profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const instructorTestAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(
      res,
      {
        userId: req.user?.userId,
        role: req.user?.role,
        accessGranted: true,
      },
      "Instructor level authorization granted"
    );
  } catch (error) {
    next(error);
  }
};

export const adminTestAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(
      res,
      {
        userId: req.user?.userId,
        role: req.user?.role,
        accessGranted: true,
      },
      "Admin level authorization granted"
    );
  } catch (error) {
    next(error);
  }
};
