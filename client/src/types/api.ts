// --- AUTH & USER TYPES ---
export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// --- CATEGORY TYPES ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
  };
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

// --- COURSE ENUMS & MODELS ---
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface PublicCourseItem {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  price: number;
  thumbnail?: string | null;
  level: CourseLevel;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  instructor: {
    id: string;
    name: string;
  };
}

export interface PublicCourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  thumbnail?: string | null;
  level: CourseLevel;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  modules: ModuleSummary[];
}

export interface ManageableCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string | null;
  price: number;
  thumbnail?: string | null;
  level: CourseLevel;
  status: CourseStatus;
  instructorId?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  instructor: {
    id: string;
    name: string;
    email?: string;
  };
  modules?: ModuleFull[];
}

export interface CreateCourseInput {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price?: number;
  thumbnail?: string;
  level?: CourseLevel;
  categoryId: string;
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  thumbnail?: string;
  level?: CourseLevel;
  categoryId?: string;
}

// --- MODULE TYPES ---
export interface ModuleSummary {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: LessonSummary[];
}

export interface ModuleFull {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
  lessons?: LessonContent[];
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  order?: number;
}

// --- LESSON TYPES ---
export type LessonType = "VIDEO" | "TEXT";

export interface LessonSummary {
  id: string;
  title: string;
  description?: string | null;
  type: LessonType;
  order: number;
}

export interface LessonContent {
  id: string;
  title: string;
  description?: string | null;
  type: LessonType;
  content?: string | null;
  videoUrl?: string | null;
  order: number;
  moduleId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  order?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  type?: LessonType;
  content?: string;
  videoUrl?: string;
  order?: number;
}

// --- PAGINATION & API RESPONSE ENVELOPES ---
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: PaginationMeta;
}
