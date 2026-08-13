import { prisma } from "../../lib/prisma.js";
import type { Role } from "@prisma/client";
import type { CreateModuleInput, UpdateModuleInput } from "../../utils/validation.js";
import type { CustomError } from "../../middlewares/error.middleware.js";

const createCustomError = (message: string, statusCode: number): CustomError => {
  const err: CustomError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const verifyCourseOwnership = (
  courseInstructorId: string,
  authUserId: string,
  authRole: Role,
  actionLabel = "manage modules for"
) => {
  if (authRole !== "ADMIN" && courseInstructorId !== authUserId) {
    throw createCustomError(
      `Access denied: You do not have permission to ${actionLabel} this course`,
      403
    );
  }
};

export const createModuleService = async (
  courseId: string,
  input: CreateModuleInput,
  authUserId: string,
  authRole: Role
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });

  if (!course) {
    throw createCustomError("Course not found", 404);
  }

  verifyCourseOwnership(course.instructorId, authUserId, authRole, "create modules for");

  return await prisma.module.create({
    data: {
      title: input.title,
      description: input.description,
      order: input.order,
      courseId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      courseId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getCourseModulesService = async (
  courseId: string,
  authUserId: string,
  authRole: Role
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });

  if (!course) {
    throw createCustomError("Course not found", 404);
  }

  verifyCourseOwnership(course.instructorId, authUserId, authRole, "view modules for");

  return await prisma.module.findMany({
    where: { courseId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      courseId: true,
      createdAt: true,
      updatedAt: true,
      lessons: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          content: true,
          videoUrl: true,
          order: true,
          moduleId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};

export const updateModuleService = async (
  moduleId: string,
  input: UpdateModuleInput,
  authUserId: string,
  authRole: Role
) => {
  const existingModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: { id: true, instructorId: true },
      },
    },
  });

  if (!existingModule) {
    throw createCustomError("Module not found", 404);
  }

  verifyCourseOwnership(
    existingModule.course.instructorId,
    authUserId,
    authRole,
    "update module in"
  );

  return await prisma.module.update({
    where: { id: moduleId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.order !== undefined && { order: input.order }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      courseId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const deleteModuleService = async (
  moduleId: string,
  authUserId: string,
  authRole: Role
) => {
  const existingModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: { id: true, instructorId: true },
      },
    },
  });

  if (!existingModule) {
    throw createCustomError("Module not found", 404);
  }

  verifyCourseOwnership(
    existingModule.course.instructorId,
    authUserId,
    authRole,
    "delete module in"
  );

  // Deleting module cascades and deletes child lessons automatically
  return await prisma.module.delete({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      courseId: true,
    },
  });
};
