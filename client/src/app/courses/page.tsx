"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiSearch,
  FiUser,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { api, ApiError } from "@/lib/api";
import type {
  PublicCourseItem,
  Category,
  CourseLevel,
  PaginationMeta,
} from "@/types/api";

const LEVEL_OPTIONS: { label: string; value: CourseLevel | "" }[] = [
  { label: "Any Level", value: "" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
  { label: "All Levels (Course)", value: "ALL_LEVELS" },
];

function CourseCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL search query parameters state
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLevel = searchParams.get("level") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [courses, setCourses] = useState<PublicCourseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize local search input with URL search param
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await api.get<Category[]>("/categories");
        if (isMounted && res.data) {
          setCategories(res.data);
        }
      } catch {
        // Silently fall back to empty category list
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update URL search parameters safely
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "" || (value === 1 && key === "page")) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      const newPath = queryString ? `/courses?${queryString}` : "/courses";
      router.push(newPath);
    },
    [router, searchParams]
  );

  // Fetch courses matching active query parameters
  useEffect(() => {
    let isMounted = true;
    async function fetchCourses() {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        query.set("page", String(currentPage));
        query.set("limit", "12");
        if (currentSearch) query.set("search", currentSearch);
        if (currentCategory) query.set("category", currentCategory);
        if (currentLevel) query.set("level", currentLevel);

        const res = await api.get<PublicCourseItem[]>(`/courses?${query.toString()}`);
        if (isMounted) {
          setCourses(res.data || []);
          setMeta(res.meta || null);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message || "Failed to load courses.");
          } else {
            setError("A network error occurred. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, [currentSearch, currentCategory, currentLevel, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push("/courses");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans mb-2">
          EXPLORE CATALOG
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary">
          Browse Courses
        </h1>
        <p className="font-sans text-base text-text-muted mt-2 max-w-2xl">
          Master modern software engineering, design, data science, and leadership with industry-crafted curriculums.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-xl border border-border bg-surface shadow-sm">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <FiSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search courses by title or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateQueryParams({ search: null, page: 1 });
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={currentCategory}
            onChange={(e) => updateQueryParams({ category: e.target.value, page: 1 })}
            className="px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans focus:border-accent focus:outline-none transition-subtle cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Level Dropdown */}
          <select
            value={currentLevel}
            onChange={(e) => updateQueryParams({ level: e.target.value, page: 1 })}
            className="px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans focus:border-accent focus:outline-none transition-subtle cursor-pointer"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {(currentSearch || currentCategory || currentLevel) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2.5 text-xs font-medium font-sans text-accent hover:text-accent-hover transition-fast flex items-center gap-1 cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-8 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => updateQueryParams({ page: currentPage })}
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-20 h-5 rounded-full bg-surface-subtle" />
                <div className="w-12 h-5 rounded bg-surface-subtle" />
              </div>
              <div className="w-3/4 h-6 rounded bg-surface-subtle" />
              <div className="w-full h-12 rounded bg-surface-subtle" />
              <div className="pt-4 border-t border-border flex justify-between">
                <div className="w-24 h-4 rounded bg-surface-subtle" />
                <div className="w-16 h-4 rounded bg-surface-subtle" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
          <FiBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-text-primary mb-2">
            No courses found
          </h3>
          <p className="font-sans text-sm text-text-muted max-w-md mx-auto mb-6">
            We couldn&apos;t find any published courses matching your filters. Try clearing your search term or filter parameters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-border-hover transition-subtle"
            >
              <div className="space-y-4">
                {/* Badge & Price Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full border border-border bg-surface-subtle text-accent text-xs font-medium font-sans">
                    {course.category?.name || "General"}
                  </span>
                  <span className="font-sans text-sm font-semibold text-text-primary">
                    {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                  </span>
                </div>

                {/* Course Title */}
                <h2 className="font-sans text-xl font-semibold text-text-primary group-hover:text-accent transition-fast line-clamp-1">
                  {course.title}
                </h2>

                {/* Short Description */}
                <p className="font-sans text-sm text-text-muted leading-relaxed line-clamp-2">
                  {course.shortDescription || "Explore the core fundamentals and advanced concepts in this course."}
                </p>
              </div>

              {/* Footer Meta & Action */}
              <div className="pt-6 mt-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-xs text-text-muted font-sans">
                  <div className="flex items-center gap-1.5 truncate">
                    <FiUser className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    <span className="truncate">{course.instructor?.name || "Instructor"}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-subtle text-text-muted uppercase">
                    {course.level.replace("_", " ")}
                  </span>
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center justify-between w-full pt-2 text-sm font-medium font-sans text-text-primary group-hover:text-accent transition-fast"
                >
                  <span>View Course Details</span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-fast text-accent" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6 font-sans">
          <div className="text-xs text-text-muted">
            Page <span className="font-semibold text-text-primary">{meta.page}</span> of{" "}
            <span className="font-semibold text-text-primary">{meta.totalPages}</span> ({meta.totalItems} courses)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrevPage}
              onClick={() => updateQueryParams({ page: currentPage - 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-subtle cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!meta.hasNextPage}
              onClick={() => updateQueryParams({ page: currentPage + 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-subtle cursor-pointer"
            >
              <span>Next</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseCatalogPage() {
  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading course catalog...
          </div>
        }
      >
        <CourseCatalogContent />
      </Suspense>
    </main>
  );
}
