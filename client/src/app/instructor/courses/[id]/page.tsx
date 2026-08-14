"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiVideo,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiChevronDown,
  FiSave,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type {
  ManageableCourse,
  Category,
  CourseLevel,
  LessonType,
} from "@/types/api";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

function CourseEditorContent({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [course, setCourse] = useState<ManageableCourse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Module & Lesson modal state
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("VIDEO");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const isAuthorized =
    isAuthenticated && (user?.role === "INSTRUCTOR" || user?.role === "ADMIN");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUpdatingCourse },
  } = useForm<{
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    level: CourseLevel;
    categoryId: string;
  }>();

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [courseRes, categoriesRes] = await Promise.all([
        api.get<ManageableCourse>(`/courses/manage/${courseId}`),
        api.get<Category[]>("/categories"),
      ]);

      if (courseRes.data) {
        setCourse(courseRes.data);
        reset({
          title: courseRes.data.title,
          description: courseRes.data.description || "",
          shortDescription: courseRes.data.shortDescription || "",
          price: courseRes.data.price || 0,
          level: courseRes.data.level,
          categoryId: courseRes.data.category?.id || "",
        });
      }
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load course details.");
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, reset]);

  useEffect(() => {
    if (!isAuthLoading && isAuthorized) {
      loadCourseData();
    }
  }, [isAuthLoading, isAuthorized, loadCourseData]);

  // Update Course General Details
  const onUpdateCourse = async (values: any) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.patch<ManageableCourse>(`/courses/manage/${courseId}`, values);
      if (res.data) {
        setCourse(res.data);
        setSuccessMessage("Course details updated successfully!");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to update course details.");
      } else {
        setError("A network error occurred while saving.");
      }
    }
  };

  // Add Module
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    setIsSubmittingModule(true);
    setError(null);

    try {
      await api.post(`/courses/${courseId}/modules`, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim() || undefined,
        order: (course?.modules?.length || 0) + 1,
      });

      setModuleTitle("");
      setModuleDesc("");
      setIsAddModuleOpen(false);
      setSuccessMessage("Module added successfully!");
      loadCourseData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to add module.");
      } else {
        setError("A network error occurred.");
      }
    } finally {
      setIsSubmittingModule(false);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) return;

    setError(null);
    try {
      await api.delete(`/modules/${moduleId}`);
      setSuccessMessage("Module deleted successfully.");
      loadCourseData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to delete module.");
      } else {
        setError("A network error occurred while deleting module.");
      }
    }
  };

  // Add Lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLesson || !lessonTitle.trim()) return;

    setIsSubmittingLesson(true);
    setError(null);

    try {
      await api.post(`/modules/${activeModuleForLesson}/lessons`, {
        title: lessonTitle.trim(),
        description: lessonDesc.trim() || undefined,
        type: lessonType,
        content: lessonContent.trim() || undefined,
        videoUrl: lessonVideoUrl.trim() || undefined,
      });

      setLessonTitle("");
      setLessonDesc("");
      setLessonContent("");
      setLessonVideoUrl("");
      setActiveModuleForLesson(null);
      setSuccessMessage("Lesson added successfully!");
      loadCourseData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to add lesson.");
      } else {
        setError("A network error occurred while adding lesson.");
      }
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    setError(null);
    try {
      await api.delete(`/lessons/${lessonId}`);
      setSuccessMessage("Lesson deleted successfully.");
      loadCourseData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to delete lesson.");
      } else {
        setError("A network error occurred while deleting lesson.");
      }
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
        Loading course editor...
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-xl border border-border bg-surface text-center shadow-sm">
        <FiLock className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-2">
          Access Restricted
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6">
          You do not have permission to manage this course.
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/instructor"
        className="inline-flex items-center gap-1.5 text-xs font-medium font-sans text-text-muted hover:text-text-primary transition-fast mb-6"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Instructor Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                course?.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              {course?.status}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            {course?.title || "Edit Course"}
          </h1>
        </div>
      </div>

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

      <div className="space-y-12">
        {/* SECTION 1: GENERAL COURSE DETAILS */}
        <section className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-xl font-medium text-text-primary mb-6">
            Course Settings & Projections
          </h2>

          <form onSubmit={handleSubmit(onUpdateCourse)} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Course Title
              </label>
              <input
                type="text"
                {...register("title", { required: true })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Short Description
              </label>
              <input
                type="text"
                {...register("shortDescription")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                Full Description
              </label>
              <textarea
                rows={4}
                {...register("description", { required: true })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                  Level
                </label>
                <select
                  {...register("level")}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold font-sans text-text-primary uppercase tracking-wider mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isUpdatingCourse}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium font-sans shadow-sm cursor-pointer"
              >
                <FiSave className="w-4 h-4" />
                <span>Save General Settings</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: CURRICULUM BUILDER */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-serif text-2xl font-medium text-text-primary">
                Curriculum Builder
              </h2>
              <p className="font-sans text-xs text-text-muted mt-1">
                Organize modules and add video/text lesson content.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModuleOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium font-sans cursor-pointer shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Add Module Modal Form */}
          {isAddModuleOpen && (
            <div className="p-6 rounded-xl border border-accent bg-surface space-y-4 shadow-md">
              <h3 className="font-serif text-lg font-medium text-text-primary">
                New Module
              </h3>
              <form onSubmit={handleAddModule} className="space-y-4">
                <input
                  type="text"
                  placeholder="Module Title (e.g., Introduction to Architecture)"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm font-sans"
                  required
                />
                <input
                  type="text"
                  placeholder="Module Summary/Description (optional)"
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm font-sans"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModuleOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingModule}
                    className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-sans font-medium"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Module List */}
          {!course?.modules || course.modules.length === 0 ? (
            <div className="p-8 rounded-xl border border-border bg-surface text-center text-sm font-sans text-text-muted">
              No modules added yet. Click &quot;Add Module&quot; to begin building your curriculum.
            </div>
          ) : (
            <div className="space-y-6">
              {course.modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm"
                >
                  <div className="p-5 flex items-center justify-between border-b border-border bg-surface-subtle">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface border border-border text-accent font-sans text-xs font-bold flex items-center justify-center shrink-0">
                        {mod.order || modIdx + 1}
                      </span>
                      <div>
                        <h3 className="font-sans text-base font-semibold text-text-primary">
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p className="font-sans text-xs text-text-muted">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModuleForLesson(mod.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium font-sans cursor-pointer"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        <span>Add Lesson</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-2 rounded-lg border border-border text-text-muted hover:text-red-600 hover:border-red-200 transition-fast cursor-pointer"
                        title="Delete Module"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add Lesson Modal Form for this Module */}
                  {activeModuleForLesson === mod.id && (
                    <div className="p-5 border-b border-border bg-surface space-y-4">
                      <h4 className="font-sans text-sm font-semibold text-text-primary">
                        Add Lesson to &quot;{mod.title}&quot;
                      </h4>
                      <form onSubmit={handleAddLesson} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Lesson Title *"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-sans"
                            required
                          />
                          <select
                            value={lessonType}
                            onChange={(e) => setLessonType(e.target.value as LessonType)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-sans"
                          >
                            <option value="VIDEO">VIDEO Lesson</option>
                            <option value="TEXT">TEXT Lesson</option>
                          </select>
                        </div>

                        {lessonType === "VIDEO" && (
                          <input
                            type="url"
                            placeholder="Video URL (e.g. https://www.youtube.com/watch?v=...)"
                            value={lessonVideoUrl}
                            onChange={(e) => setLessonVideoUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-sans"
                          />
                        )}

                        <textarea
                          rows={3}
                          placeholder="Lesson Content / Summary text"
                          value={lessonContent}
                          onChange={(e) => setLessonContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-sans"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveModuleForLesson(null)}
                            className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-sans"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingLesson}
                            className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-sans font-medium"
                          >
                            Save Lesson
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lessons List */}
                  <div className="divide-y divide-border px-5 py-2">
                    {!mod.lessons || mod.lessons.length === 0 ? (
                      <div className="py-3 text-xs font-sans text-text-muted italic">
                        No lessons in this module yet.
                      </div>
                    ) : (
                      mod.lessons.map((les) => (
                        <div
                          key={les.id}
                          className="py-3 flex items-center justify-between gap-4 font-sans text-xs"
                        >
                          <div className="flex items-center gap-3 truncate">
                            {les.type === "VIDEO" ? (
                              <FiVideo className="w-4 h-4 text-accent shrink-0" />
                            ) : (
                              <FiFileText className="w-4 h-4 text-text-muted shrink-0" />
                            )}
                            <span className="font-medium text-text-primary truncate">
                              {les.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-subtle text-text-muted uppercase">
                              {les.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(les.id)}
                              className="text-text-muted hover:text-red-600 transition-fast cursor-pointer p-1"
                              title="Delete Lesson"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = use(params);

  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading course editor...
          </div>
        }
      >
        <CourseEditorContent courseId={id} />
      </Suspense>
    </main>
  );
}
