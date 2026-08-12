import Link from "next/link";
import { FiArrowRight, FiCompass } from "react-icons/fi";

export default function FinalCTA() {
  return (
    <section
      className="py-20 md:py-28 bg-background border-b border-border"
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Editorial Accent Rule */}
        <div
          className="mx-auto mb-8 h-px w-16 bg-accent animate-fade-in"
          aria-hidden="true"
        />

        <div className="animate-slide-up space-y-4">
          {/* Eyebrow */}
          <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
            START YOUR NEXT CHAPTER
          </div>

          {/* Main Heading */}
          <h2
            id="final-cta-heading"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-text-primary"
          >
            Your Next Skill Starts Here.
          </h2>

          {/* Supporting Description */}
          <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mt-5">
            Choose a direction, follow a thoughtful path, and build skills that stay useful long after the course ends.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-accent hover:bg-accent-hover text-white font-sans text-sm font-medium transition-subtle shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              Explore Courses
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-fast" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-border bg-surface hover:border-border-hover text-text-primary font-sans text-sm font-medium transition-subtle cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              <FiCompass className="w-4 h-4 text-text-muted" />
              Browse Categories
            </Link>
          </div>

          {/* Small Supporting Line */}
          <p className="font-sans text-xs text-text-muted pt-2">
            No pressure. Just a better place to start.
          </p>
        </div>
      </div>
    </section>
  );
}
