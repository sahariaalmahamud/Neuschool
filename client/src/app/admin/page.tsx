"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiShield,
  FiBookOpen,
  FiCheckCircle,
  FiFileText,
  FiArchive,
  FiFolder,
  FiSearch,
  FiAlertCircle,
  FiLock,
  FiExternalLink,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { ManageableCourse, Category, CourseStatus } from "@/types/api";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [courses, setCourses] = useState<ManageableCourse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle: string;
    action: "publish" | "archive";
  }>({
    isOpen: false,
    courseId: "",
    courseTitle: "",
    action: "publish",
  });

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  // Verify Admin DB Role Access
  const verifyAdminAccess = useCallback(async () => {
    if (!isAdmin) return;
    setIsVerifyingAdmin(true);
    try {
      const res = await api.get<{ message?: string }>("/auth/admin-test");
      setAdminVerified(res.success !== false);
    } catch {
      setAdminVerified(false);
    } finally {
      setIsVerifyingAdmin(false);
    }
  }, [isAdmin]);

  // Fetch Platform Courses & Categories for Admin Overview
  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);

    try {
      const courseEndpoint = selectedStatus
        ? `/courses/manage?status=${selectedStatus}`
        : "/courses/manage";

      const [coursesRes, categoriesRes] = await Promise.all([
        api.get<ManageableCourse[]>(courseEndpoint),
        api.get<Category[]>("/categories"),
      ]);

      if (coursesRes.data) {
        setCourses(coursesRes.data);
      }
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load admin platform data.");
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, selectedStatus]);

  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      fetchAdminData();
      verifyAdminAccess();
    }
  }, [isAuthLoading, isAdmin, fetchAdminData, verifyAdminAccess]);

  // Handle Admin Mutation Actions
  const handleExecuteAction = async () => {
    const { courseId, action } = confirmModal;
    if (!courseId) return;

    setError(null);
    setSuccessMessage(null);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      if (action === "publish") {
        await api.patch(`/courses/manage/${courseId}/publish`);
        setSuccessMessage("Course published successfully.");
      } else if (action === "archive") {
        await api.patch(`/courses/manage/${courseId}/archive`);
        setSuccessMessage("Course archived successfully.");
      }
      fetchAdminData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || `Failed to ${action} course.`);
      } else {
        setError(`A network error occurred while performing ${action}.`);
      }
    }
  };

  // Filter courses by local search term
  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      c.title.toLowerCase().includes(query) ||
      c.instructor?.name?.toLowerCase().includes(query) ||
      c.category?.name?.toLowerCase().includes(query)
    );
  });

  // Calculate platform statistics
  const totalCoursesCount = courses.length;
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;
  const archivedCount = courses.filter((c) => c.status === "ARCHIVED").length;

  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
        Verifying admin authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/admin");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-xl border border-border bg-surface text-center shadow-sm">
        <FiLock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-2">
          Admin Access Required
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6 leading-relaxed">
          You are signed in as <strong className="text-text-primary">{user?.name}</strong> ({user?.role}), but this area is restricted to Administrator accounts only.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-sans transition-subtle shadow-sm"
          >
            Return Home
          </Link>
          <Link
            href="/login?redirect=/admin"
            className="px-4 py-2 rounded-lg border border-border bg-background text-text-primary text-sm font-medium font-sans transition-subtle"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 uppercase tracking-wider font-sans">
              SYSTEM ADMIN
            </span>
            {adminVerified === true && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 font-sans flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> DB Verified
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">
            Platform Administration
          </h1>
          <p className="font-sans text-sm text-text-muted mt-1">
            Overview of all platform courses, publishing status, and category structures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchAdminData();
            verifyAdminAccess();
          }}
          disabled={isLoading || isVerifyingAdmin}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-surface text-text-primary text-xs font-medium font-sans hover:border-border-hover transition-subtle shrink-0 cursor-pointer"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Platform Overview Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              Total Courses
            </span>
            <FiBookOpen className="w-4 h-4 text-accent" />
          </div>
          <div className="font-sans text-2xl font-bold text-text-primary">
            {totalCoursesCount}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              Published
            </span>
            <FiCheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="font-sans text-2xl font-bold text-green-600 dark:text-green-400">
            {publishedCount}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              Drafts
            </span>
            <FiFileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-sans text-2xl font-bold text-amber-600 dark:text-amber-400">
            {draftCount}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              Archived
            </span>
            <FiArchive className="w-4 h-4 text-text-muted" />
          </div>
          <div className="font-sans text-2xl font-bold text-text-muted">
            {archivedCount}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              Categories
            </span>
            <FiFolder className="w-4 h-4 text-accent" />
          </div>
          <div className="font-sans text-2xl font-bold text-text-primary">
            {categories.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-xl border border-border bg-surface shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <FiSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search platform courses by title or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All Statuses", value: "" },
            { label: "Drafts", value: "DRAFT" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Archived", value: "ARCHIVED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value as CourseStatus | "")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-subtle shrink-0 cursor-pointer ${
                selectedStatus === tab.value
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-background text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Courses Management Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-surface animate-pulse h-20"
            />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
          <FiBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-text-primary mb-2">
            No courses found
          </h3>
          <p className="font-sans text-sm text-text-muted max-w-md mx-auto">
            No platform courses match your current search or status filter.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Course Title</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-surface-hover transition-fast">
                    <td className="py-4 px-4 sm:px-6 font-semibold text-text-primary max-w-xs truncate">
                      <div className="truncate">{course.title}</div>
                      <div className="text-[11px] font-normal text-text-muted truncate">
                        Slug: /{course.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-text-muted">
                      <div className="flex items-center gap-1.5 truncate">
                        <FiUser className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{course.instructor?.name || "Unknown"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-text-muted">
                      {course.category?.name || "General"}
                    </td>

                    <td className="py-4 px-4 font-semibold text-text-primary">
                      {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                    </td>

                    <td className="py-4 px-4">
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
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {course.status === "PUBLISHED" && (
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary hover:border-border-hover transition-fast"
                            title="View Public Course"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        {course.status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                courseId: course.id,
                                courseTitle: course.title,
                                action: "publish",
                              })
                            }
                            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-subtle shadow-sm cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {course.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                courseId: course.id,
                                courseTitle: course.title,
                                action: "archive",
                              })
                            }
                            className="px-2.5 py-1 rounded border border-border text-text-muted hover:text-text-primary hover:border-border-hover text-xs font-medium transition-subtle cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg space-y-4">
            <h3 className="font-serif text-xl font-medium text-text-primary">
              Confirm {confirmModal.action === "publish" ? "Publish" : "Archive"} Action
            </h3>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Are you sure you want to {confirmModal.action} the course &quot;
              <strong className="text-text-primary">{confirmModal.courseTitle}</strong>&quot;?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-border bg-background text-text-primary text-xs font-medium font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-lg text-white text-xs font-medium font-sans cursor-pointer shadow-sm ${
                  confirmModal.action === "publish"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-accent hover:bg-accent-hover"
                }`}
              >
                Confirm {confirmModal.action === "publish" ? "Publish" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading admin dashboard...
          </div>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </main>
  );
}
