import { prisma } from "../../lib/prisma.js";
import type { CourseLevel, CourseStatus, Prisma, Role } from "@prisma/client";
import type { CreateCourseInput, UpdateCourseInput } from "../../utils/validation.js";
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
  actionLabel = "manage"
) => {
  if (authRole !== "ADMIN" && courseInstructorId !== authUserId) {
    throw createCustomError(`Access denied: You do not have permission to ${actionLabel} this course`, 403);
  }
};

// --- PUBLIC COURSE SERVICES ---

export interface CourseFilterParams {
  categorySlug?: string;
  level?: CourseLevel;
  search?: string;
  skip: number;
  limit: number;
}

export const getPublicCoursesService = async (params: CourseFilterParams) => {
  const { categorySlug, level, search, skip, limit } = params;

  // Enforce status = PUBLISHED for public API
  const where: Prisma.CourseWhereInput = {
    status: "PUBLISHED",
  };

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (level) {
    where.level = level;
  }

  if (search && search.trim() !== "") {
    const searchFilter = search.trim();
    where.OR = [
      { title: { contains: searchFilter, mode: "insensitive" } },
      { shortDescription: { contains: searchFilter, mode: "insensitive" } },
      { description: { contains: searchFilter, mode: "insensitive" } },
    ];
  }

  const [courses, totalItems] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        thumbnail: true,
        level: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, totalItems };
};

export const getPublicCourseBySlugService = async (slug: string) => {
  return await prisma.course.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
        },
      },
      modules: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          lessons: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              order: true,
            },
          },
        },
      },
    },
  });
};

// --- INSTRUCTOR / ADMIN COURSE MANAGEMENT SERVICES ---

export interface ManageableCourseFilterParams {
  status?: CourseStatus;
  categorySlug?: string;
  level?: CourseLevel;
  search?: string;
  skip: number;
  limit: number;
}

export const getManageableCoursesService = async (
  authUserId: string,
  authRole: Role,
  params: ManageableCourseFilterParams
) => {
  const { status, categorySlug, level, search, skip, limit } = params;

  const where: Prisma.CourseWhereInput = {};

  // INSTRUCTORS are strictly scoped to their own created courses
  if (authRole === "INSTRUCTOR") {
    where.instructorId = authUserId;
  }

  if (status) {
    where.status = status;
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (level) {
    where.level = level;
  }

  if (search && search.trim() !== "") {
    const searchFilter = search.trim();
    where.OR = [
      { title: { contains: searchFilter, mode: "insensitive" } },
      { shortDescription: { contains: searchFilter, mode: "insensitive" } },
      { description: { contains: searchFilter, mode: "insensitive" } },
    ];
  }

  const [courses, totalItems] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        thumbnail: true,
        level: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, totalItems };
};

export const getCourseByIdService = async (
  id: string,
  authUserId: string,
  authRole: Role
) => {
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      instructorId: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      modules: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
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
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw createCustomError("Course not found", 404);
  }

  verifyCourseOwnership(course.instructorId, authUserId, authRole, "view");

  return course;
};

export const createCourseService = async (
  input: CreateCourseInput,
  authUserId: string
) => {
  const { title, slug, description, shortDescription, price, thumbnail, level, categoryId } = input;

  // 1. Verify Category existence
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!categoryExists) {
    throw createCustomError("Referenced category does not exist", 400);
  }

  // 2. Verify Slug uniqueness
  const slugExists = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (slugExists) {
    throw createCustomError("A course with this slug already exists", 409);
  }

  // 3. Create course bound to creating instructor/user ID
  return await prisma.course.create({
    data: {
      title,
      slug,
      description,
      shortDescription,
      price,
      thumbnail,
      level,
      status: "DRAFT",
      categoryId,
      instructorId: authUserId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const updateCourseService = async (
  id: string,
  input: UpdateCourseInput,
  authUserId: string,
  authRole: Role
) => {
  // 1. Find existing course
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    select: { id: true, categoryId: true, instructorId: true },
  });

  if (!existingCourse) {
    throw createCustomError("Course not found", 404);
  }

  // 2. Enforce resource ownership
  verifyCourseOwnership(existingCourse.instructorId, authUserId, authRole, "update");

  // 3. Validate category if updated
  if (input.categoryId && input.categoryId !== existingCourse.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      throw createCustomError("Referenced category does not exist", 400);
    }
  }

  // 4. Validate slug if updated
  if (input.slug) {
    const duplicateSlug = await prisma.course.findFirst({
      where: {
        slug: input.slug,
        NOT: { id },
      },
      select: { id: true },
    });
    if (duplicateSlug) {
      throw createCustomError("A course with this slug already exists", 409);
    }
  }

  // 5. Perform update (excluding status changes)
  return await prisma.course.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.slug && { slug: input.slug }),
      ...(input.description && { description: input.description }),
      ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
      ...(input.level && { level: input.level }),
      ...(input.categoryId && { categoryId: input.categoryId }),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const publishCourseService = async (
  id: string,
  authUserId: string,
  authRole: Role
) => {
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, status: true, instructorId: true },
  });

  if (!course) {
    throw createCustomError("Course not found", 404);
  }

  verifyCourseOwnership(course.instructorId, authUserId, authRole, "publish");

  if (course.status === "PUBLISHED") {
    throw createCustomError("Course is already published", 400);
  }

  if (course.status === "ARCHIVED") {
    throw createCustomError("Archived courses cannot be published directly", 400);
  }

  return await prisma.course.update({
    where: { id },
    data: {
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const archiveCourseService = async (
  id: string,
  authUserId: string,
  authRole: Role
) => {
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, status: true, instructorId: true },
  });

  if (!course) {
    throw createCustomError("Course not found", 404);
  }

  verifyCourseOwnership(course.instructorId, authUserId, authRole, "archive");

  return await prisma.course.update({
    where: { id },
    data: {
      status: "ARCHIVED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      thumbnail: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};
