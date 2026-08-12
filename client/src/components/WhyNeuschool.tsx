import { FiTarget, FiLayers, FiTrendingUp, FiArrowRight } from "react-icons/fi";

const LEARNING_PILLARS = [
  {
    title: "Learn With Clarity",
    description:
      "Follow focused curriculums that turn complex subjects into clear, practical learning paths.",
    icon: FiTarget,
  },
  {
    title: "Build Real Skills",
    description:
      "Learn through modern tools, practical frameworks, and projects designed around real-world problems.",
    icon: FiLayers,
  },
  {
    title: "Grow With Confidence",
    description:
      "Develop skills that compound over time and help you move forward in your career with confidence.",
    icon: FiTrendingUp,
  },
];

export default function WhyNeuschool() {
  return (
    <section
      className="py-16 md:py-24 bg-background border-b border-border"
      aria-labelledby="why-neuschool-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-14 space-y-3 animate-slide-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
            THE NEUSCHOOL APPROACH
          </div>
          <h2
            id="why-neuschool-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text-primary"
          >
            Learn Better. Build Further.
          </h2>
          <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Thoughtfully structured learning designed to help you understand deeply, practice deliberately, and apply what you learn.
          </p>
        </div>

        {/* Learning Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
          {LEARNING_PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            const numberLabel = `0${index + 1}`;
            return (
              <article
                key={pillar.title}
                className="group rounded-lg border border-border bg-surface p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-border-hover transition-subtle flex flex-col justify-between"
              >
                <div>
                  {/* Icon Container & Editorial Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-surface-subtle border border-border text-accent">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold tracking-widest text-text-muted font-sans">
                      {numberLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-sans text-xl font-semibold text-text-primary group-hover:text-accent transition-fast">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm text-text-muted leading-relaxed mt-2">
                    {pillar.description}
                  </p>
                </div>

                {/* Card Footer Treatment */}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent font-sans mt-6">
                    Explore the approach
                    <FiArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-fast"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Editorial Statement */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-border text-center">
          <p className="font-serif text-xl sm:text-2xl italic text-text-primary max-w-3xl mx-auto">
            &ldquo;Good learning does more than teach you what to know. It changes what you can do.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
