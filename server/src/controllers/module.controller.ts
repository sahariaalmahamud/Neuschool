import type { Request, Response, NextFunction } from "express";
import {
  createModuleService,
  getCourseModulesService,
  updateModuleService,
  deleteModuleService,
} from "../services/module/module.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  validateCreateModuleInput,
  validateUpdateModuleInput,
} from "../utils/validation.js";

export const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { courseId } = req.params;
    if (!courseId || typeof courseId !== "string") {
      sendError(res, "Course ID is required", 400);
      return;
    }

    const validatedInput = validateCreateModuleInput(req.body);
    const newModule = await createModuleService(
      courseId,
      validatedInput,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, newModule, "Module created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getCourseModules = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { courseId } = req.params;
    if (!courseId || typeof courseId !== "string") {
      sendError(res, "Course ID is required", 400);
      return;
    }

    const modules = await getCourseModulesService(
      courseId,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, modules, "Modules fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      sendError(res, "Module ID is required", 400);
      return;
    }

    const validatedInput = validateUpdateModuleInput(req.body);
    const updatedModule = await updateModuleService(
      id,
      validatedInput,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, updatedModule, "Module updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      sendError(res, "Module ID is required", 400);
      return;
    }

    const deletedModule = await deleteModuleService(
      id,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, deletedModule, "Module deleted successfully");
  } catch (error) {
    next(error);
  }
};
