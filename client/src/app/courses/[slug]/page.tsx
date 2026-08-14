import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiUser,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiChevronDown,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { api, ApiError } from "@/lib/api";
import type { PublicCourseDetail } from "@/types/api";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;

  let course: PublicCourseDetail;
  try {
    const res = await api.get<PublicCourseDetail>(`/courses/${slug}`);
    if (!res.data) {
      notFound();
    }
    course = res.data;
  } catch (err: any) {
    if (err instanceof ApiError && err.statusCode === 404) {
      notFound();
    }
    notFound();
  }

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0),
    0
  );

  return (
    <main className="flex-1 bg-background py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-sans text-text-muted">
          <Link href="/" className="hover:text-text-primary transition-fast">
            Home
          </Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-text-primary transition-fast">
            Courses
          </Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-xs">{course.title}</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mb-12">
          {/* Main Hero Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full border border-border bg-surface-subtle text-accent text-xs font-semibold font-sans">
                {course.category?.name || "General"}
              </span>
              <span className="px-3 py-1 rounded-full border border-border bg-surface text-text-muted text-xs font-semibold font-sans uppercase">
                {course.level.replace("_", " ")}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-tight">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed">
                {course.shortDescription}
              </p>
            )}

            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs sm:text-sm font-sans text-text-muted">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-accent shrink-0" />
                <span>
                  Instructed by{" "}
                  <strong className="text-text-primary font-semibold">
                    {course.instructor?.name || "Instructor"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FiBookOpen className="w-4 h-4 text-text-muted shrink-0" />
                <span>
                  {course.modules.length} Modules ({totalLessons} Lessons)
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Sidebar Card */}
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-24">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider font-sans text-text-muted">
                Course Price
              </div>
              <div className="font-sans text-3xl sm:text-4xl font-bold text-text-primary">
                {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/login?redirect=/courses/${course.slug}`}
                className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm flex items-center justify-center gap-2 text-center"
              >
                <span>Enroll in Course</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-xs font-sans text-text-muted">
                Sign in or register to access full learning content.
              </p>
            </div>

            <div className="pt-6 border-t border-border space-y-3 text-xs font-sans text-text-muted">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>Full access to course modules & lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>Self-paced learning curriculum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Description */}
        <section className="mb-16 max-w-4xl space-y-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="font-serif text-2xl font-medium text-text-primary">
            Course Overview
          </h2>
          <div className="font-sans text-base text-text-muted leading-relaxed whitespace-pre-line border-t border-border pt-4">
            {course.description || "No full description available for this course."}
          </div>
        </section>

        {/* Course Syllabus / Curriculum */}
        <section className="max-w-4xl space-y-6" aria-labelledby="curriculum-heading">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 id="curriculum-heading" className="font-serif text-2xl font-medium text-text-primary">
                Course Curriculum
              </h2>
              <p className="font-sans text-xs sm:text-sm text-text-muted mt-1">
                {course.modules.length} Modules • {totalLessons} Total Lessons
              </p>
            </div>
          </div>

          {course.modules.length === 0 ? (
            <div className="p-8 rounded-xl border border-border bg-surface text-center font-sans text-sm text-text-muted">
              No modules have been published for this course yet.
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((moduleItem, modIdx) => (
                <details
                  key={moduleItem.id}
                  open={modIdx === 0}
                  className="group rounded-xl border border-border bg-surface overflow-hidden transition-subtle"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-surface-hover transition-fast list-none">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-subtle border border-border text-accent font-sans text-xs font-bold flex items-center justify-center shrink-0">
                        {moduleItem.order || modIdx + 1}
                      </span>
                      <div>
                        <h3 className="font-sans text-base font-semibold text-text-primary group-hover:text-accent transition-fast">
                          {moduleItem.title}
                        </h3>
                        {moduleItem.description && (
                          <p className="font-sans text-xs text-text-muted mt-0.5 line-clamp-1">
                            {moduleItem.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-sans text-text-muted shrink-0">
                      <span>{moduleItem.lessons?.length || 0} lessons</span>
                      <FiChevronDown className="w-5 h-5 group-open:rotate-180 transition-fast" />
                    </div>
                  </summary>

                  {/* Lessons List inside Module */}
                  <div className="border-t border-border bg-background/50 divide-y divide-border px-5 py-3">
                    {!moduleItem.lessons || moduleItem.lessons.length === 0 ? (
                      <div className="py-3 text-xs font-sans text-text-muted italic">
                        No lessons in this module yet.
                      </div>
                    ) : (
                      moduleItem.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="py-3 flex items-center justify-between gap-4 font-sans text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3 truncate">
                            {lesson.type === "VIDEO" ? (
                              <FiVideo className="w-4 h-4 text-accent shrink-0" />
                            ) : (
                              <FiFileText className="w-4 h-4 text-text-muted shrink-0" />
                            )}
                            <span className="font-medium text-text-primary truncate">
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border text-text-muted uppercase">
                              {lesson.type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
