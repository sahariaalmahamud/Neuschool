import { prisma } from "../../lib/prisma.js";
import type { Role, LessonType } from "@prisma/client";
import type { CreateLessonInput, UpdateLessonInput } from "../../utils/validation.js";
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
  actionLabel = "manage lessons for"
) => {
  if (authRole !== "ADMIN" && courseInstructorId !== authUserId) {
    throw createCustomError(
      `Access denied: You do not have permission to ${actionLabel} this course`,
      403
    );
  }
};

export const createLessonService = async (
  moduleId: string,
  input: CreateLessonInput,
  authUserId: string,
  authRole: Role
) => {
  const moduleRecord = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: { id: true, instructorId: true },
      },
    },
  });

  if (!moduleRecord) {
    throw createCustomError("Module not found", 404);
  }

  verifyCourseOwnership(
    moduleRecord.course.instructorId,
    authUserId,
    authRole,
    "create lessons in"
  );

  return await prisma.lesson.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      content: input.content,
      videoUrl: input.videoUrl,
      order: input.order,
      moduleId,
    },
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
  });
};

export const getModuleLessonsService = async (
  moduleId: string,
  authUserId: string,
  authRole: Role
) => {
  const moduleRecord = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: { id: true, instructorId: true },
      },
    },
  });

  if (!moduleRecord) {
    throw createCustomError("Module not found", 404);
  }

  verifyCourseOwnership(
    moduleRecord.course.instructorId,
    authUserId,
    authRole,
    "view lessons in"
  );

  return await prisma.lesson.findMany({
    where: { moduleId },
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
  });
};

export const getLessonContentService = async (
  lessonId: string,
  authUserId: string,
  authRole: Role
) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, status: true, instructorId: true },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw createCustomError("Lesson not found", 404);
  }

  const course = lesson.module.course;

  // 1. ADMIN or Course Owner INSTRUCTOR has full management access
  if (authRole === "ADMIN" || course.instructorId === authUserId) {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      moduleId: lesson.moduleId,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }

  // 2. For Students / other users, parent course must be PUBLISHED
  if (course.status !== "PUBLISHED") {
    throw createCustomError("Lesson not found", 404);
  }

  // 3. Verify student enrollment in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: authUserId,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    throw createCustomError(
      "Access denied: You must be enrolled in this course to access lesson content",
      403
    );
  }

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    order: lesson.order,
    moduleId: lesson.moduleId,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
};

export const updateLessonService = async (
  lessonId: string,
  input: UpdateLessonInput,
  authUserId: string,
  authRole: Role
) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, instructorId: true },
          },
        },
      },
    },
  });

  if (!existingLesson) {
    throw createCustomError("Lesson not found", 404);
  }

  verifyCourseOwnership(
    existingLesson.module.course.instructorId,
    authUserId,
    authRole,
    "update lesson in"
  );

  const finalType: LessonType = input.type || existingLesson.type;
  const finalContent = input.content !== undefined ? input.content : existingLesson.content;
  const finalVideoUrl = input.videoUrl !== undefined ? input.videoUrl : existingLesson.videoUrl;

  if (finalType === "TEXT" && (!finalContent || finalContent.trim().length === 0)) {
    throw createCustomError("Content is required for TEXT type lessons", 400);
  }

  if (finalType === "VIDEO" && (!finalVideoUrl || finalVideoUrl.trim().length === 0)) {
    throw createCustomError("videoUrl is required for VIDEO type lessons", 400);
  }

  return await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.type && { type: input.type }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl }),
      ...(input.order !== undefined && { order: input.order }),
    },
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
  });
};

export const deleteLessonService = async (
  lessonId: string,
  authUserId: string,
  authRole: Role
) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, instructorId: true },
          },
        },
      },
    },
  });

  if (!existingLesson) {
    throw createCustomError("Lesson not found", 404);
  }

  verifyCourseOwnership(
    existingLesson.module.course.instructorId,
    authUserId,
    authRole,
    "delete lesson in"
  );

  return await prisma.lesson.delete({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      moduleId: true,
    },
  });
};
