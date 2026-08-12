import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../utils/response.js";

const VALID_ROLES = Object.values(Role);

/**
 * Middleware factory for role-based authorization using JWT token role payload.
 * Usage: router.get('/path', authenticateMiddleware, authorizeRoles(Role.ADMIN), controller)
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.userId) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const userRole = req.user.role;

    // Validate that userRole is a recognized Prisma Role enum value
    if (!userRole || !VALID_ROLES.includes(userRole)) {
      sendError(res, "Invalid or unrecognized user role", 403);
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      sendError(res, "Access denied: Insufficient permissions", 403);
      return;
    }

    next();
  };
};

/**
 * Middleware factory for role-based authorization with live database role verification.
 * Verifies current role directly from PostgreSQL to handle cases where user role was changed.
 */
export const authorizeRolesWithDbCheck = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        sendError(res, "Authentication required", 401);
        return;
      }

      // Query live database role from PostgreSQL
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, role: true },
      });

      if (!dbUser) {
        sendError(res, "Authenticated user account no longer exists", 401);
        return;
      }

      const currentRole = dbUser.role;

      if (!VALID_ROLES.includes(currentRole)) {
        sendError(res, "Invalid or unrecognized database user role", 403);
        return;
      }

      if (!allowedRoles.includes(currentRole)) {
        sendError(res, "Access denied: Insufficient permissions", 403);
        return;
      }

      // Sync req.user.role with updated database role
      req.user.role = currentRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};
