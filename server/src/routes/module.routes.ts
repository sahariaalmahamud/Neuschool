import { Router } from "express";
import { Role } from "@prisma/client";
import {
  updateModule,
  deleteModule,
} from "../controllers/module.controller.js";
import {
  createLesson,
  getModuleLessons,
} from "../controllers/lesson.controller.js";
import { authenticateMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRolesWithDbCheck } from "../middlewares/role.middleware.js";

const router = Router();

// Module update and delete
router.patch(
  "/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  updateModule
);

router.delete(
  "/:id",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  deleteModule
);

// Lesson creation and listing under a module
router.post(
  "/:moduleId/lessons",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  createLesson
);

router.get(
  "/:moduleId/lessons",
  authenticateMiddleware,
  authorizeRolesWithDbCheck(Role.INSTRUCTOR, Role.ADMIN),
  getModuleLessons
);

export default router;
