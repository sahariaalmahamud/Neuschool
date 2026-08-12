import Link from "next/link";
import { FiArrowRight, FiCompass, FiStar, FiUsers, FiBookOpen } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-slide-up">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-subtle text-accent text-xs font-semibold uppercase tracking-widest font-sans">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              LEARN WITH PURPOSE
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-text-primary leading-[1.1]">
              Build Skills That <br className="hidden sm:inline" />
              <span className="italic font-normal text-accent">Shape Your Future.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="font-sans text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed">
              Neuschool is an editorial learning management platform crafted for curious minds. 
              Master modern technologies, design systems, and leadership through structured, 
              expert-led curriculums.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-accent hover:bg-accent-hover text-white font-sans text-sm font-medium transition-subtle shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              >
                Explore Courses
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-border bg-surface hover:border-border-hover text-text-primary font-sans text-sm font-medium transition-subtle cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              >
                <FiCompass className="w-4 h-4 text-text-muted" />
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Stat Feature Card */}
          <div className="lg:col-span-5 animate-fade-in">
            <div className="relative rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-md space-y-6">
              {/* Decorative Accent Glow Header */}
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <div className="font-serif text-2xl font-semibold text-text-primary">
                    Neuschool Academy
                  </div>
                  <div className="text-xs text-text-muted font-sans mt-0.5">
                    Excellence in Digital Education
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded border border-border bg-surface-subtle text-accent text-xs font-mono font-medium">
                  v2.0
                </span>
              </div>

              {/* Stats Highlight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border">
                  <div className="p-2 rounded bg-accent/10 text-accent shrink-0">
                    <FiStar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-sans text-lg font-bold text-text-primary">4.9/5</div>
                    <div className="text-xs text-text-muted">Student Rating</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border">
                  <div className="p-2 rounded bg-accent/10 text-accent shrink-0">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-sans text-lg font-bold text-text-primary">12,000+</div>
                    <div className="text-xs text-text-muted">Active Learners</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border">
                  <div className="p-2 rounded bg-accent/10 text-accent shrink-0">
                    <FiBookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-sans text-lg font-bold text-text-primary">100+</div>
                    <div className="text-xs text-text-muted">Expert-Led Curriculums</div>
                  </div>
                </div>
              </div>

              {/* Editorial Quote Footer */}
              <div className="pt-2 text-xs text-text-muted italic border-t border-border">
                &ldquo;Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
