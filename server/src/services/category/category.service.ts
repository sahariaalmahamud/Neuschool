import { prisma } from "../../lib/prisma.js";

export const getAllCategoriesService = async () => {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          courses: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
    },
  });
};

export const getCategoryBySlugService = async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
