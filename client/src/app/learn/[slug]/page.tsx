"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiMenu,
  FiX,
  FiPlayCircle,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { PublicCourseDetail, LessonContent, LessonSummary } from "@/types/api";

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

function getEmbedVideoUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
}

function LearnContent({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [course, setCourse] = useState<PublicCourseDetail | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [visitedLessons, setVisitedLessons] = useState<Set<string>>(new Set());

  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [isLessonLoading, setIsLessonLoading] = useState(false);

  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // 1. Fetch Course Syllabus & Modules
  useEffect(() => {
    let isMounted = true;
    async function loadCourse() {
      setIsCourseLoading(true);
      setCourseError(null);

      try {
        const res = await api.get<PublicCourseDetail>(`/courses/${courseSlug}`);
        if (isMounted && res.data) {
          setCourse(res.data);

          // Select initial lesson from URL param or first lesson in syllabus
          const initialLessonParam = searchParams.get("lesson");
          const allLessons = res.data.modules.flatMap((m) => m.lessons || []);

          if (initialLessonParam && allLessons.some((l) => l.id === initialLessonParam)) {
            setActiveLessonId(initialLessonParam);
          } else if (allLessons.length > 0) {
            setActiveLessonId(allLessons[0].id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setCourseError(err.message || "Failed to load course content.");
          } else {
            setCourseError("A network error occurred. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setIsCourseLoading(false);
        }
      }
    }

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseSlug, searchParams]);

  // 2. Fetch Protected Content for Active Lesson
  const loadLessonContent = useCallback(
    async (lessonId: string) => {
      setIsLessonLoading(true);
      setLessonError(null);
      setAccessDeniedMessage(null);
      setLessonContent(null);

      try {
        const res = await api.get<LessonContent>(`/lessons/${lessonId}/content`);
        if (res.data) {
          setLessonContent(res.data);
          setVisitedLessons((prev) => new Set(prev).add(lessonId));
        }
      } catch (err: any) {
        if (err instanceof ApiError) {
          if (err.statusCode === 403) {
            setAccessDeniedMessage(
              err.message || "Access denied: Enrollment is required to view this lesson."
            );
          } else {
            setLessonError(err.message || "Failed to load lesson content.");
          }
        } else {
          setLessonError("A network error occurred while retrieving lesson.");
        }
      } finally {
        setIsLessonLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeLessonId && isAuthenticated) {
      loadLessonContent(activeLessonId);
    }
  }, [activeLessonId, isAuthenticated, loadLessonContent]);

  // Handle switching active lesson
  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setIsSidebarOpenMobile(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lesson", lessonId);
    router.replace(`/learn/${courseSlug}?${params.toString()}`);
  };

  // Flatten all lessons across modules for ordered sequence
  const allLessonsWithModule =
    course?.modules.flatMap((mod) =>
      (mod.lessons || []).map((les) => ({
        ...les,
        moduleTitle: mod.title,
        moduleId: mod.id,
      }))
    ) || [];

  const currentLessonIndex = allLessonsWithModule.findIndex(
    (l) => l.id === activeLessonId
  );
  const prevLesson =
    currentLessonIndex > 0 ? allLessonsWithModule[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessonsWithModule.length - 1
      ? allLessonsWithModule[currentLessonIndex + 1]
      : null;

  // Authentication Guard
  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-xl border border-border bg-surface text-center shadow-sm">
        <FiLock className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-2">
          Authentication Required
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6">
          Please sign in to your Neuschool account to access your course learning portal.
        </p>
        <Link
          href={`/login?redirect=/learn/${courseSlug}`}
          className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm inline-block"
        >
          Sign In to Learn
        </Link>
      </div>
    );
  }

  if (isCourseLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
        Loading learning workspace...
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-xl border border-border bg-surface text-center shadow-sm">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-2">
          Course Not Found
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6">
          {courseError || "The requested course could not be loaded."}
        </p>
        <Link
          href="/courses"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-sans inline-block"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedVideoUrl(lessonContent?.videoUrl);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Top Header Bar */}
      <header className="sticky top-16 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 truncate">
          <Link
            href={`/courses/${course.slug}`}
            className="p-1.5 rounded-md border border-border bg-background hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-fast shrink-0"
            title="Back to Course Details"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="truncate">
            <h1 className="font-serif text-base sm:text-lg font-medium text-text-primary truncate">
              {course.title}
            </h1>
            <p className="font-sans text-xs text-text-muted truncate">
              {allLessonsWithModule.length} Total Lessons • Instructed by {course.instructor?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block text-xs font-sans text-text-muted">
            Lesson <strong className="text-text-primary">{currentLessonIndex + 1}</strong> of{" "}
            <strong className="text-text-primary">{allLessonsWithModule.length}</strong>
          </span>

          <button
            type="button"
            onClick={() => setIsSidebarOpenMobile((prev) => !prev)}
            className="md:hidden p-2 rounded-md border border-border bg-background text-text-primary cursor-pointer"
            aria-label="Toggle Syllabus Sidebar"
          >
            {isSidebarOpenMobile ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Syllabus Navigation Sidebar */}
        <aside
          className={`w-full md:w-80 border-r border-border bg-surface/50 shrink-0 flex flex-col ${
            isSidebarOpenMobile ? "block" : "hidden md:flex"
          }`}
        >
          <div className="p-4 border-b border-border font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
            Course Curriculum
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {course.modules.length === 0 ? (
              <div className="p-4 text-xs font-sans text-text-muted italic text-center">
                No modules available in this course yet.
              </div>
            ) : (
              course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="p-3 space-y-2">
                  <div className="text-xs font-semibold font-sans text-text-primary flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-subtle text-accent text-[11px] flex items-center justify-center font-bold">
                      {mod.order || modIdx + 1}
                    </span>
                    <span className="truncate">{mod.title}</span>
                  </div>

                  <div className="space-y-1 pl-2">
                    {mod.lessons?.map((les) => {
                      const isActive = les.id === activeLessonId;
                      const isVisited = visitedLessons.has(les.id);

                      return (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => handleSelectLesson(les.id)}
                          className={`w-full text-left p-2 rounded-lg text-xs font-sans flex items-center justify-between gap-2 transition-fast cursor-pointer ${
                            isActive
                              ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
                              : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {les.type === "VIDEO" ? (
                              <FiVideo className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <FiFileText className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>

                          {isVisited && (
                            <FiCheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Lesson Display & Player Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {/* Top Previous / Next Bar */}
          <div className="flex items-center justify-between border-b border-border pb-4 font-sans text-xs">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-subtle cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Lesson</span>
            </button>

            <div className="font-semibold text-text-primary truncate max-w-xs sm:max-w-md text-center">
              {allLessonsWithModule.find((l) => l.id === activeLessonId)?.title || "Select a Lesson"}
            </div>

            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && handleSelectLesson(nextLesson.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-subtle cursor-pointer"
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lesson Content Area */}
          {isLessonLoading ? (
            <div className="p-12 text-center font-sans text-sm text-text-muted animate-pulse">
              Loading lesson content...
            </div>
          ) : accessDeniedMessage ? (
            /* Enrollment Access Denied State */
            <div className="my-8 p-8 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <FiLock className="w-12 h-12 text-amber-600 mx-auto" />
              <h2 className="font-serif text-2xl font-medium">
                Enrollment Required
              </h2>
              <p className="font-sans text-sm leading-relaxed">
                {accessDeniedMessage}
              </p>
              <div className="pt-2">
                <Link
                  href={`/courses/${course.slug}`}
                  className="px-5 py-2.5 rounded-lg bg-accent text-white font-sans text-xs font-semibold inline-block transition-subtle shadow-sm"
                >
                  View Enrollment Options
                </Link>
              </div>
            </div>
          ) : lessonError ? (
            <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-sans flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 shrink-0" />
              <span>{lessonError}</span>
            </div>
          ) : lessonContent ? (
            <div className="space-y-6">
              {/* Video Player */}
              {lessonContent.type === "VIDEO" && (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-border shadow-md relative">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={lessonContent.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
                        <FiPlayCircle className="w-12 h-12 mb-2 text-accent" />
                        <p className="text-sm font-sans">
                          No playable video URL available for this lesson.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson Metadata Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-surface-subtle border border-border text-accent uppercase font-sans">
                    {lessonContent.type} LESSON
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
                  {lessonContent.title}
                </h2>
                {lessonContent.description && (
                  <p className="font-sans text-sm text-text-muted leading-relaxed">
                    {lessonContent.description}
                  </p>
                )}
              </div>

              {/* Text Article Content */}
              {lessonContent.content && (
                <article className="p-6 sm:p-8 rounded-xl border border-border bg-surface shadow-sm space-y-4 font-sans text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-line">
                  {lessonContent.content}
                </article>
              )}
            </div>
          ) : (
            <div className="p-12 text-center font-sans text-sm text-text-muted">
              Select a lesson from the curriculum sidebar to start learning.
            </div>
          )}

          {/* Bottom Next Lesson CTA */}
          {nextLesson && !accessDeniedMessage && (
            <div className="pt-8 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => handleSelectLesson(nextLesson.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold font-sans transition-subtle shadow-sm cursor-pointer"
              >
                <span>Continue to Next Lesson</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function LearnPage({ params }: LearnPageProps) {
  const { slug } = use(params);

  return (
    <main className="flex-1 bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans text-sm text-text-muted">
            Loading student workspace...
          </div>
        }
      >
        <LearnContent courseSlug={slug} />
      </Suspense>
    </main>
  );
}
