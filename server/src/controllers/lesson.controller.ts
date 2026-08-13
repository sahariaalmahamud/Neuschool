import type { Request, Response, NextFunction } from "express";
import {
  createLessonService,
  getModuleLessonsService,
  getLessonContentService,
  updateLessonService,
  deleteLessonService,
} from "../services/lesson/lesson.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  validateCreateLessonInput,
  validateUpdateLessonInput,
} from "../utils/validation.js";

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { moduleId } = req.params;
    if (!moduleId || typeof moduleId !== "string") {
      sendError(res, "Module ID is required", 400);
      return;
    }

    const validatedInput = validateCreateLessonInput(req.body);
    const newLesson = await createLessonService(
      moduleId,
      validatedInput,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, newLesson, "Lesson created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getModuleLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { moduleId } = req.params;
    if (!moduleId || typeof moduleId !== "string") {
      sendError(res, "Module ID is required", 400);
      return;
    }

    const lessons = await getModuleLessonsService(
      moduleId,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, lessons, "Lessons fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const getLessonContent = async (
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
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    const lesson = await getLessonContentService(
      id,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, lesson, "Lesson content retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (
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
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    const validatedInput = validateUpdateLessonInput(req.body);
    const updatedLesson = await updateLessonService(
      id,
      validatedInput,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, updatedLesson, "Lesson updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (
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
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    const deletedLesson = await deleteLessonService(
      id,
      req.user.userId,
      req.user.role
    );

    sendSuccess(res, deletedLesson, "Lesson deleted successfully");
  } catch (error) {
    next(error);
  }
};
