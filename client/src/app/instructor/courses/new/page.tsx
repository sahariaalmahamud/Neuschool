"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Category, ManageableCourse } from "@/types/api";

const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters long"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(10, "Description must be at least 10 characters long"),
  shortDescription: z.string().trim().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]),
  categoryId: z.string().min(1, "Please select a category"),
});

type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CreateCourseContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const isAuthorized =
    isAuthenticated && (user?.role === "INSTRUCTOR" || user?.role === "ADMIN");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCourseFormValues>({
    defaultValues: {
      price: 0,
      level: "BEGINNER",
    },
  });

  const titleValue = watch("title");

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isSlugManuallyEdited, setValue]);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await api.get<Category[]>("/categories");
        if (isMounted && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setValue("categoryId", res.data[0].id);
          }
        }
      } catch {
        // Handle silently
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [setValue]);

  const onSubmit = async (values: CreateCourseFormValues) => {
    setServerError(null);

    try {
      const res = await api.post<ManageableCourse>("/courses/manage", values);
      if (res.data && res.data.id) {
        router.push(`/instructor/courses/${res.data.id}`);
      } else {
        router.push("/instructor");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          setServerError("A course with this URL slug already exists. Please choose a unique slug.");
        } else {
          setServerError(err.message || "Failed to create course.");
        }
      } else {
        setServerError("A network error occurred. Please try again.");
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-xl border border-border bg-surface text-center shadow-sm">
        <FiLock className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-2">
          Instructor Access Required
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6">
          Only instructors and administrators can create new courses.
        </p>
        <Link
          href="/instructor"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-sans inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back Link */}
      <Link
        href="/instructor"
        className="inline-flex items-center gap-1.5 text-xs font-medium font-sans text-text-muted hover:text-text-primary transition-fast mb-6"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Instructor Dashboard</span>
      </Link>

      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans mb-1">
          NEW COURSE
        </div>
        <h1 className="font-serif text-3xl font-medium text-text-primary">
          Create a New Course
        </h1>
        <p className="font-sans text-sm text-text-muted mt-1">
          Fill out the core details to initialize a course in DRAFT status.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        {serverError && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-sans flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
              Course Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Advanced React Server Components & Next.js"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters long",
                },
              })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-sans">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
              URL Slug *
            </label>
            <input
              id="slug"
              type="text"
              placeholder="advanced-react-server-components"
              {...register("slug", {
                required: "URL Slug is required",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "Slug must contain only lowercase letters, numbers, and hyphens",
                },
                minLength: {
                  value: 3,
                  message: "Slug must be at least 3 characters long",
                },
                onChange: () => setIsSlugManuallyEdited(true),
              })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
            />
            <p className="mt-1 text-[11px] text-text-muted font-sans">
              This forms the public course URL (e.g. /courses/your-slug-here)
            </p>
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-sans">
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
              Short Description
            </label>
            <input
              id="shortDescription"
              type="text"
              placeholder="A concise 1-2 sentence summary displayed on course catalog cards."
              {...register("shortDescription")}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
              Full Course Description *
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Detailed explanation of what students will learn in this course..."
              {...register("description", {
                required: "Full description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters long",
                },
              })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle resize-y"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-sans">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category, Level, Price Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                id="categoryId"
                {...register("categoryId", { required: "Category is required" })}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans focus:border-accent focus:outline-none transition-subtle cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-sans">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Course Level *
              </label>
              <select
                id="level"
                {...register("level")}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans focus:border-accent focus:outline-none transition-subtle cursor-pointer"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Price (USD $)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Price cannot be negative",
                  },
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-sans">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <Link
              href="/instructor"
              className="px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-surface text-text-primary text-sm font-medium font-sans transition-subtle"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <span>Create & Build Curriculum</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading course creation form...
          </div>
        }
      >
        <CreateCourseContent />
      </Suspense>
    </main>
  );
}
