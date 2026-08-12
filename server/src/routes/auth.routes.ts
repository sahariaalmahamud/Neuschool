import { Router } from "express";
import { Role } from "@prisma/client";
import {
  register,
  login,
  getMe,
  instructorTestAccess,
  adminTestAccess,
} from "../controllers/auth.controller.js";
import { authenticateMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRolesWithDbCheck } from "../middlewares/role.middleware.js";

const router = Router();

// Public Authentication Routes
router.post("/register", register);
router.post("/login", login);

// Protected User Route
router.get("/me", authenticateMiddleware, getMe);

// Role-Based Authorization Test Routes (verifies user role against DB on every request)
router.get(
  "/instructor-test",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  instructorTestAccess
);

router.get(
  "/admin-test",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.ADMIN),
  adminTestAccess
);

export default router;
