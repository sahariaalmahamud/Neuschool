import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

export interface CustomError extends Error {
  statusCode?: number;
  status?: number;
}

export const errorMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (env.NODE_ENV === "development") {
    console.error(`[Error] ${statusCode} - ${message}`, err.stack);
  }

  sendError(
    res,
    message,
    statusCode,
    env.NODE_ENV === "development" ? err.stack : undefined
  );
};
