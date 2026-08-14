"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiSearch, FiMenu, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md transition-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-serif text-2xl font-medium tracking-tight text-text-primary flex items-center gap-1 hover:opacity-90 transition-fast"
            >
              Neuschool
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {[
                { label: "Courses", href: "/courses" },
                { label: "Categories", href: "/categories" },
                { label: "Instructors", href: "/instructors" },
                { label: "About", href: "/about" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm font-medium text-text-muted hover:text-text-primary transition-fast"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search dialog"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text-primary hover:border-border-hover transition-subtle text-xs font-sans cursor-pointer"
            >
              <FiSearch className="w-4 h-4 text-text-muted" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-subtle border border-border rounded">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3 min-w-[140px] justify-end">
              {isLoading ? (
                <div className="w-24 h-8 rounded-md bg-surface-subtle animate-pulse" />
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-border bg-surface text-xs font-sans">
                    <FiUser className="w-3.5 h-3.5 text-accent" />
                    <span className="font-medium text-text-primary max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-surface-subtle text-accent uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans text-text-muted hover:text-text-primary transition-fast rounded-md border border-border hover:border-border-hover cursor-pointer"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 text-sm font-medium font-sans text-text-primary hover:text-accent transition-fast rounded-md"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 text-sm font-medium font-sans bg-accent hover:bg-accent-hover text-white rounded-md transition-subtle shadow-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-md border border-border bg-surface text-text-primary hover:border-border-hover transition-subtle cursor-pointer"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Overlays */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
}
