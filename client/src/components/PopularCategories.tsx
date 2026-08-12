import Link from "next/link";
import {
  FiCode,
  FiPenTool,
  FiBarChart2,
  FiCpu,
  FiUsers,
  FiBriefcase,
  FiArrowUpRight,
} from "react-icons/fi";

interface Category {
  title: string;
  slug: string;
  description: string;
  icon: React.ElementType;
}

const POPULAR_CATEGORIES: Category[] = [
  {
    title: "Development",
    slug: "development",
    description: "Build modern software and web applications.",
    icon: FiCode,
  },
  {
    title: "Design",
    slug: "design",
    description: "Create thoughtful digital products and experiences.",
    icon: FiPenTool,
  },
  {
    title: "Data Science",
    slug: "data-science",
    description: "Turn data into decisions and meaningful insights.",
    icon: FiBarChart2,
  },
  {
    title: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description: "Build intelligent systems for the next generation.",
    icon: FiCpu,
  },
  {
    title: "Leadership",
    slug: "leadership",
    description: "Develop the skills to lead products and teams.",
    icon: FiUsers,
  },
  {
    title: "Business",
    slug: "business",
    description: "Understand strategy, growth, and modern business.",
    icon: FiBriefcase,
  },
];

export default function PopularCategories() {
  return (
    <section
      className="py-16 md:py-24 bg-surface border-b border-border"
      aria-labelledby="popular-categories-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans mb-2">
            EXPLORE BY CATEGORY
          </div>
          <h2
            id="popular-categories-heading"
            className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-text-primary"
          >
            Find Your Direction.
          </h2>
          <p className="font-sans text-base text-text-muted mt-2 max-w-xl">
            Explore focused learning paths built around the skills shaping modern careers.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {POPULAR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-border-hover transition-subtle cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              >
                <div className="space-y-4">
                  {/* Icon & Arrow Header */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-surface-subtle text-accent border border-border shrink-0">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <FiArrowUpRight
                      className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-fast"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Category Title & Description */}
                  <div>
                    <h3 className="font-sans text-xl font-semibold text-text-primary group-hover:text-accent transition-fast">
                      {cat.title}
                    </h3>
                    <p className="font-sans text-sm text-text-muted mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
