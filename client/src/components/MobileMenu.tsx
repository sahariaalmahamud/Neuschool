"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export default function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-2xl font-medium tracking-tight text-text-primary flex items-center gap-1"
        >
          Neuschool<span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-md border border-border bg-surface text-text-primary hover:border-border-hover transition-subtle cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary hover:border-border-hover transition-subtle text-left cursor-pointer"
          >
            <FiSearch className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-sans">Search courses, topics...</span>
          </button>

          <nav className="flex flex-col space-y-4" aria-label="Mobile navigation links">
            {[
              { label: "Courses", href: "/courses" },
              { label: "Categories", href: "/categories" },
              { label: "Instructors", href: "/instructors" },
              { label: "About", href: "/about" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="font-sans text-xl font-medium text-text-primary hover:text-accent transition-fast"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-border flex flex-col gap-3">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 text-center rounded-md border border-border bg-surface text-text-primary font-sans text-sm font-medium hover:border-border-hover transition-subtle"
          >
            Log In
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="w-full py-3 text-center rounded-md bg-accent hover:bg-accent-hover text-white font-sans text-sm font-medium transition-subtle shadow-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
