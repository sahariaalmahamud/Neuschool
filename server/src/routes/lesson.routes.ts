import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getLessonContent,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";
import { authenticateMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRolesWithDbCheck } from "../middlewares/role.middleware.js";

const router = Router();

// Protected Lesson Content Endpoint (Requires authentication & enrollment/ownership/admin role)
router.get(
  "/:id/content",
  authenticateMiddleware,
  getLessonContent
);

// Instructor / Admin Management Endpoints
router.patch(
  "/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  updateLesson
);

router.delete(
  "/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  deleteLesson
);

export default router;
