import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getCourses,
  getCourseBySlug,
  createCourse,
  getManageableCourses,
  getCourseById,
  updateCourse,
  publishCourse,
  archiveCourse,
} from "../controllers/course.controller.js";
import {
  createModule,
  getCourseModules,
} from "../controllers/module.controller.js";
import { authenticateMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRolesWithDbCheck } from "../middlewares/role.middleware.js";

const router = Router();

// 1. PUBLIC READ ENDPOINTS
router.get("/", getCourses);
router.get(
  "/manage",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  getManageableCourses
);
router.get(
  "/manage/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  getCourseById
);
router.get("/:slug", getCourseBySlug);

// 2. INSTRUCTOR & ADMIN COURSE MANAGEMENT ENDPOINTS
router.post(
  "/",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  createCourse
);

router.patch(
  "/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  updateCourse
);

router.patch(
  "/:id/publish",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  publishCourse
);

router.patch(
  "/:id/archive",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  archiveCourse
);

// 3. COURSE MODULE MANAGEMENT ENDPOINTS
router.post(
  "/:courseId/modules",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  createModule
);

router.get(
  "/:courseId/modules",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  getCourseModules
);

export default router;
