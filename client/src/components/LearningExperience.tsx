import { FiLayers, FiTool, FiTrendingUp, FiArrowUpRight } from "react-icons/fi";

const EXPERIENCE_ITEMS = [
  {
    title: "Structured Learning",
    description:
      "Move through thoughtfully organized lessons that give every topic a clear beginning, middle, and next step.",
    icon: FiLayers,
  },
  {
    title: "Practical Application",
    description:
      "Turn ideas into useful skills through projects, frameworks, and exercises inspired by real-world work.",
    icon: FiTool,
  },
  {
    title: "Continuous Progress",
    description:
      "Build momentum with a learning path that helps you measure progress, revisit ideas, and keep moving forward.",
    icon: FiTrendingUp,
  },
];

export default function LearningExperience() {
  return (
    <section
      className="py-16 md:py-24 bg-surface border-b border-border"
      aria-labelledby="learning-experience-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Section Intro */}
          <div className="lg:col-span-5 space-y-4 animate-slide-up">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
              THE LEARNING EXPERIENCE
            </div>
            <h2
              id="learning-experience-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text-primary"
            >
              A Better Way to Learn.
            </h2>
            <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Neuschool brings structure, practice, and progress together so learning becomes something you can actually build on.
            </p>
            <div className="h-px w-16 bg-accent" aria-hidden="true" />
          </div>

          {/* Right Column: Stacked Experience Items */}
          <div className="lg:col-span-7 animate-fade-in divide-y divide-border">
            {EXPERIENCE_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const numberLabel = `0${index + 1}`;
              return (
                <div
                  key={item.title}
                  className="group flex gap-5 py-6 first:pt-0 last:pb-0"
                >
                  {/* Icon Container */}
                  <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg bg-surface-subtle border border-border text-accent">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  {/* Item Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-sans text-xl font-semibold text-text-primary group-hover:text-accent transition-fast">
                        {item.title}
                      </h3>
                      <span className="text-xs font-semibold tracking-widest text-text-muted font-sans shrink-0">
                        {numberLabel}
                      </span>
                    </div>
                    <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed mt-2 max-w-xl">
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <FiArrowUpRight
                    className="w-5 h-5 shrink-0 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-fast self-start mt-1"
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
