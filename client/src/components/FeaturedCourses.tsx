import Link from "next/link";
import { FiUser, FiClock, FiBookOpen, FiArrowRight, FiStar } from "react-icons/fi";

interface Course {
  id: string;
  category: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  rating: number;
}

const FEATURED_COURSES: Course[] = [
  {
    id: "fullstack-engineering",
    category: "Development",
    title: "Full-Stack Web Engineering",
    description: "Master Next.js App Router, TypeScript, PostgreSQL, and modern server architectures with production-grade practices.",
    instructor: "Dr. Aris Thorne",
    level: "Intermediate",
    duration: "8 Weeks",
    rating: 4.9,
  },
  {
    id: "editorial-ui-systems",
    category: "Design",
    title: "Editorial UI/UX Systems",
    description: "Craft high-converting, accessible design tokens, dynamic typography hierarchies, and glassmorphic micro-interactions.",
    instructor: "Elena Rostova",
    level: "Advanced",
    duration: "6 Weeks",
    rating: 4.95,
  },
  {
    id: "data-analytics",
    category: "Data Science",
    title: "Modern Data Analytics & Visuals",
    description: "Transform raw datasets into actionable executive insights with Python, SQL, and interactive dashboard architectures.",
    instructor: "Marcus Vance",
    level: "Beginner",
    duration: "10 Weeks",
    rating: 4.8,
  },
  {
    id: "applied-ml",
    category: "AI & ML",
    title: "Applied Machine Learning Systems",
    description: "Build, fine-tune, and deploy scalable ML pipelines and generative AI models using production cloud workflows.",
    instructor: "Dr. Sophia Lin",
    level: "Advanced",
    duration: "12 Weeks",
    rating: 4.9,
  },
  {
    id: "design-systems-arch",
    category: "Architecture",
    title: "Design Systems Architecture",
    description: "Scale frontend applications with modular design tokens, reusable component libraries, and automated testing.",
    instructor: "Julian Miller",
    level: "Intermediate",
    duration: "6 Weeks",
    rating: 4.85,
  },
  {
    id: "product-strategy",
    category: "Leadership",
    title: "Product Strategy for Leaders",
    description: "Learn proven frameworks for roadmapping, stakeholder alignment, and driving product-led growth in modern teams.",
    instructor: "Sarah Jenkins",
    level: "All Levels",
    duration: "4 Weeks",
    rating: 4.92,
  },
];

export default function FeaturedCourses() {
  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="featured-courses-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans mb-2">
              CURATED CURRICULUMS
            </div>
            <h2
              id="featured-courses-heading"
              className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-text-primary"
            >
              Featured Courses
            </h2>
            <p className="font-sans text-base text-text-muted mt-2 max-w-xl">
              Handcrafted learning paths designed by industry experts to advance your skills.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-medium font-sans text-accent hover:text-accent-hover transition-fast w-fit group"
          >
            View all courses
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-fast" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURED_COURSES.map((course) => (
            <article
              key={course.id}
              className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-border-hover transition-subtle"
            >
              <div className="space-y-4">
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full border border-border bg-surface-subtle text-accent text-xs font-medium font-sans">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
                    <FiStar className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-sans text-xl font-semibold text-text-primary group-hover:text-accent transition-fast line-clamp-1">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-sm text-text-muted leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Footer Metadata & Action Link */}
              <div className="pt-6 mt-6 border-t border-border space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted font-sans">
                  <div className="flex items-center gap-1.5 truncate">
                    <FiUser className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FiBookOpen className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center justify-between w-full pt-2 text-sm font-medium font-sans text-text-primary group-hover:text-accent transition-fast"
                >
                  <span>View Course Details</span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-fast text-accent" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
