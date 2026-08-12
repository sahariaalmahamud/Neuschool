import { prisma } from "../../lib/prisma.js";
import type { CourseLevel, Prisma } from "@prisma/client";

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
    },
  });
};
