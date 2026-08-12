"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search courses and articles"
    >
      <div
        className="w-full max-w-xl rounded-lg border border-border bg-surface shadow-lg overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border">
          <FiSearch className="w-5 h-5 text-text-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, categories, instructors..."
            className="w-full py-4 text-base bg-transparent text-text-primary placeholder:text-text-muted outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-text-muted hover:text-text-primary rounded cursor-pointer"
              aria-label="Clear search query"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs font-medium rounded border border-border text-text-muted hover:text-text-primary hover:border-border-hover transition-fast cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {query ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {["Web Development", "UI/UX Design", "Data Science", "TypeScript", "Machine Learning"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      aria-label={`Search for ${tag}`}
                      className="px-3 py-1.5 rounded-md border border-border bg-surface-subtle text-xs text-text-primary hover:border-border-hover transition-fast cursor-pointer"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
