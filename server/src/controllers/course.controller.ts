import type { Request, Response, NextFunction } from "express";
import type { CourseLevel, CourseStatus } from "@prisma/client";
import {
  getPublicCoursesService,
  getPublicCourseBySlugService,
  createCourseService,
  getManageableCoursesService,
  getCourseByIdService,
  updateCourseService,
  publishCourseService,
  archiveCourseService,
} from "../services/course/course.service.js";
import { getPagination } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { VALID_COURSE_LEVELS } from "../types/course.types.js";
import {
  validateCreateCourseInput,
  validateUpdateCourseInput,
} from "../utils/validation.js";

// --- PUBLIC COURSE CONTROLLERS ---

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search, category, level } = req.query;

    if (page !== undefined) {
      const pageNum = Number(String(page).trim());
      if (!Number.isInteger(pageNum) || pageNum < 1) {
        sendError(
          res,
          "Query parameter 'page' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    if (limit !== undefined) {
      const limitNum = Number(String(limit).trim());
      if (!Number.isInteger(limitNum) || limitNum < 1) {
        sendError(
          res,
          "Query parameter 'limit' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    let validatedLevel: CourseLevel | undefined = undefined;
    if (level !== undefined && typeof level === "string" && level.trim() !== "") {
      const upperLevel = level.trim().toUpperCase() as CourseLevel;
      if (!VALID_COURSE_LEVELS.includes(upperLevel)) {
        sendError(
          res,
          `Invalid level parameter. Allowed values are: ${VALID_COURSE_LEVELS.join(", ")}`,
          400
        );
        return;
      }
      validatedLevel = upperLevel;
    }

    const { page: currentPage, limit: currentLimit, skip, formatMeta } = getPagination(
      { page: page as string, limit: limit as string },
      12,
      100
    );

    const { courses, totalItems } = await getPublicCoursesService({
      categorySlug: typeof category === "string" ? category.trim() : undefined,
      level: validatedLevel,
      search: typeof search === "string" ? search : undefined,
      skip,
      limit: currentLimit,
    });

    const meta = formatMeta(totalItems);

    sendSuccess(res, courses, "Courses fetched successfully", 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      sendError(res, "Course slug is required", 400);
      return;
    }

    const course = await getPublicCourseBySlugService(slug);
    if (!course) {
      sendError(res, "Course not found", 404);
      return;
    }

    sendSuccess(res, course, "Course fetched successfully");
  } catch (error) {
    next(error);
  }
};

// --- INSTRUCTOR / ADMIN COURSE MANAGEMENT CONTROLLERS ---

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const validatedInput = validateCreateCourseInput(req.body);
    const newCourse = await createCourseService(validatedInput, req.user.userId);
    sendSuccess(res, newCourse, "Course created successfully in DRAFT status", 201);
  } catch (error) {
    next(error);
  }
};

export const getManageableCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId || !req.user.role) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { page, limit, search, status, category, level } = req.query;

    if (page !== undefined) {
      const pageNum = Number(String(page).trim());
      if (!Number.isInteger(pageNum) || pageNum < 1) {
        sendError(
          res,
          "Query parameter 'page' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    if (limit !== undefined) {
      const limitNum = Number(String(limit).trim());
      if (!Number.isInteger(limitNum) || limitNum < 1) {
        sendError(
          res,
          "Query parameter 'limit' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    let validatedStatus: CourseStatus | undefined = undefined;
    if (status !== undefined && typeof status === "string" && status.trim() !== "") {
      const upperStatus = status.trim().toUpperCase() as CourseStatus;
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(upperStatus)) {
        sendError(res, "Invalid status parameter. Allowed: DRAFT, PUBLISHED, ARCHIVED", 400);
        return;
      }
      validatedStatus = upperStatus;
    }

    let validatedLevel: CourseLevel | undefined = undefined;
    if (level !== undefined && typeof level === "string" && level.trim() !== "") {
      const upperLevel = level.trim().toUpperCase() as CourseLevel;
      if (!VALID_COURSE_LEVELS.includes(upperLevel)) {
        sendError(
          res,
          `Invalid level parameter. Allowed values are: ${VALID_COURSE_LEVELS.join(", ")}`,
          400
        );
        return;
      }
      validatedLevel = upperLevel;
    }

    const { page: currentPage, limit: currentLimit, skip, formatMeta } = getPagination(
      { page: page as string, limit: limit as string },
      12,
      100
    );

    const { courses, totalItems } = await getManageableCoursesService(
      req.user.userId,
      req.user.role,
      {
        status: validatedStatus,
        categorySlug: typeof category === "string" ? category.trim() : undefined,
        level: validatedLevel,
        search: typeof search === "string" ? search : undefined,
        skip,
        limit: currentLimit,
      }
    );

    const meta = formatMeta(totalItems);

    sendSuccess(res, courses, "Manageable courses fetched successfully", 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (
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
      sendError(res, "Course ID is required", 400);
      return;
    }

    const course = await getCourseByIdService(id, req.user.userId, req.user.role);
    sendSuccess(res, course, "Course details fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
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
      sendError(res, "Course ID is required", 400);
      return;
    }

    const validatedInput = validateUpdateCourseInput(req.body);
    const updatedCourse = await updateCourseService(id, validatedInput, req.user.userId, req.user.role);
    sendSuccess(res, updatedCourse, "Course updated successfully");
  } catch (error) {
    next(error);
  }
};

export const publishCourse = async (
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
      sendError(res, "Course ID is required", 400);
      return;
    }

    const publishedCourse = await publishCourseService(id, req.user.userId, req.user.role);
    sendSuccess(res, publishedCourse, "Course published successfully");
  } catch (error) {
    next(error);
  }
};

export const archiveCourse = async (
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
      sendError(res, "Course ID is required", 400);
      return;
    }

    const archivedCourse = await archiveCourseService(id, req.user.userId, req.user.role);
    sendSuccess(res, archivedCourse, "Course archived successfully");
  } catch (error) {
    next(error);
  }
};
