"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto" aria-label="Application Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* 1. Brand & Editorial Intro */}
          <div className="lg:col-span-4 space-y-3">
            <Link
              href="/"
              className="font-serif text-2xl font-medium tracking-tight text-text-primary inline-flex items-center gap-1 hover:opacity-90 transition-fast"
            >
              Neuschool
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>
            <p className="font-sans text-sm text-text-muted leading-relaxed max-w-sm">
              A thoughtful learning platform for building practical skills, exploring new directions, and growing with purpose.
            </p>
          </div>

          {/* 2. Explore Navigation */}
          <div className="lg:col-span-2">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link
                  href="/courses"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/instructors"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Instructors
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Company Navigation */}
          <div className="lg:col-span-2">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Company
            </h3>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link
                  href="/about"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm font-sans text-text-muted hover:text-accent transition-fast"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter Subscription */}
          <div className="lg:col-span-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Stay in the loop
            </h3>
            <p className="font-sans text-sm text-text-muted mb-4 leading-relaxed">
              Occasional notes on learning, skills, and building a better career.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address for newsletter"
                required
                className="px-3.5 py-2 text-sm rounded-md bg-background border border-border text-text-primary placeholder:text-text-muted outline-none focus-visible:outline-2 focus-visible:outline-accent flex-1 font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium font-sans bg-accent hover:bg-accent-hover text-white rounded-md transition-subtle cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-text-muted">
          <div>
            &copy; {new Date().getFullYear()} Neuschool. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-text-primary transition-fast">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-fast">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
