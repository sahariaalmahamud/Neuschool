"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiBookOpen,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiArchive,
  FiLock,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { ManageableCourse, CourseStatus } from "@/types/api";

function InstructorDashboardContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [courses, setCourses] = useState<ManageableCourse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isAuthorized =
    isAuthenticated && (user?.role === "INSTRUCTOR" || user?.role === "ADMIN");

  const fetchCourses = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = selectedStatus
        ? `/courses/manage?status=${selectedStatus}`
        : "/courses/manage";
      const res = await api.get<ManageableCourse[]>(endpoint);
      setCourses(res.data || []);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load instructor courses.");
      } else {
        setError("A network error occurred. Please try again.");
      }
    }
    setIsLoading(false);
  }, [isAuthorized, selectedStatus]);

  useEffect(() => {
    if (!isAuthLoading && isAuthorized) {
      fetchCourses();
    }
  }, [isAuthLoading, isAuthorized, fetchCourses]);

  const handlePublishCourse = async (courseId: string) => {
    setError(null);
    setActionSuccess(null);

    try {
      await api.patch(`/courses/manage/${courseId}/publish`);
      setActionSuccess("Course published successfully!");
      fetchCourses();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to publish course.");
      } else {
        setError("A network error occurred while publishing.");
      }
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    setError(null);
    setActionSuccess(null);

    try {
      await api.patch(`/courses/manage/${courseId}/archive`);
      setActionSuccess("Course archived successfully.");
      fetchCourses();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to archive course.");
      } else {
        setError("A network error occurred while archiving.");
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
        <p className="font-sans text-sm text-text-muted mb-6 leading-relaxed">
          You must be signed in with an Instructor or Admin account to access the course management dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login?redirect=/instructor"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-surface text-text-primary text-sm font-medium font-sans transition-subtle"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans mb-1">
            INSTRUCTOR DASHBOARD
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">
            Course Management
          </h1>
          <p className="font-sans text-sm text-text-muted mt-1">
            Create, edit, build modules, and publish your course curriculums.
          </p>
        </div>

        <Link
          href="/instructor/courses/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { label: "All Courses", value: "" },
          { label: "Drafts", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Archived", value: "ARCHIVED" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedStatus(tab.value as CourseStatus | "")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-subtle shrink-0 cursor-pointer ${
              selectedStatus === tab.value
                ? "bg-accent text-white shadow-sm"
                : "border border-border bg-surface text-text-muted hover:text-text-primary hover:border-border-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-border bg-surface animate-pulse h-28"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
          <FiBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-text-primary mb-2">
            No courses found
          </h3>
          <p className="font-sans text-sm text-text-muted max-w-md mx-auto mb-6">
            You haven&apos;t created any courses matching this filter status yet.
          </p>
          <Link
            href="/instructor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Your First Course</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-xl border border-border bg-surface shadow-sm hover:border-border-hover transition-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                      course.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                        : course.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-surface-subtle text-text-muted border border-border"
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="text-xs font-sans text-text-muted">
                    • {course.category?.name || "General"}
                  </span>
                  <span className="text-xs font-sans text-text-muted">
                    • {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                  </span>
                </div>

                <h3 className="font-sans text-lg font-semibold text-text-primary">
                  {course.title}
                </h3>

                {course.shortDescription && (
                  <p className="font-sans text-xs text-text-muted line-clamp-1 max-w-2xl">
                    {course.shortDescription}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-subtle text-xs font-medium font-sans text-text-primary hover:border-border-hover transition-subtle"
                >
                  <FiLayers className="w-3.5 h-3.5 text-accent" />
                  <span>Curriculum Builder</span>
                </Link>

                {course.status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => handlePublishCourse(course.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium font-sans transition-subtle shadow-sm cursor-pointer"
                  >
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                )}

                {course.status !== "ARCHIVED" && (
                  <button
                    type="button"
                    onClick={() => handleArchiveCourse(course.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium font-sans text-text-muted hover:text-text-primary hover:border-border-hover transition-subtle cursor-pointer"
                  >
                    <FiArchive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading dashboard...
          </div>
        }
      >
        <InstructorDashboardContent />
      </Suspense>
    </main>
  );
}
