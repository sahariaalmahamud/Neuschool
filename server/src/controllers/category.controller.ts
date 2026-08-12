import type { Request, Response, NextFunction } from "express";
import {
  getAllCategoriesService,
  getCategoryBySlugService,
} from "../services/category/category.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await getAllCategoriesService();
    sendSuccess(res, categories, "Categories fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      sendError(res, "Category slug is required", 400);
      return;
    }

    const category = await getCategoryBySlugService(slug);
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }

    sendSuccess(res, category, "Category fetched successfully");
  } catch (error) {
    next(error);
  }
};
