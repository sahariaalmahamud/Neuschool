import type { Request, Response, NextFunction } from "express";
import type { CourseLevel } from "@prisma/client";
import {
  getPublicCoursesService,
  getPublicCourseBySlugService,
} from "../services/course/course.service.js";
import { getPagination } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { VALID_COURSE_LEVELS } from "../types/course.types.js";

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search, category, level } = req.query;

    // Validate page & limit numbers if supplied
    if (page !== undefined) {
      const pageNum = Number(page);
      if (isNaN(pageNum) || pageNum < 1) {
        sendError(
          res,
          "Query parameter 'page' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    if (limit !== undefined) {
      const limitNum = Number(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        sendError(
          res,
          "Query parameter 'limit' must be a positive integer greater than or equal to 1",
          400
        );
        return;
      }
    }

    // Validate level parameter if supplied
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
