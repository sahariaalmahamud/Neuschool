import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../lib/jwt.js";
import { sendError } from "../utils/response.js";
import type { JwtPayload } from "../types/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, "Authentication header missing", 401);
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    sendError(res, "Authentication header must be in 'Bearer <token>' format", 401);
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    sendError(res, "Authentication token missing", 401);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId || !decoded.role) {
      sendError(res, "Invalid authentication token payload", 401);
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, "Authentication token has expired. Please login again.", 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, "Invalid authentication token", 401);
      return;
    }
    sendError(res, "Authentication failed", 401);
  }
};
