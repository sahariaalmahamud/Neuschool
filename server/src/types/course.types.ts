import type { CourseLevel } from "@prisma/client";

export interface GetCoursesQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  level?: string;
}

export const VALID_COURSE_LEVELS: readonly CourseLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ALL_LEVELS",
] as const;
