import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
