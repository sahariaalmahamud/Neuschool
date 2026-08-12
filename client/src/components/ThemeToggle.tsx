"use client";

import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    const storedTheme = localStorage.getItem("neu-theme");
    const activeDark = storedTheme === "dark" || (!storedTheme && hasDarkClass);

    if (activeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    requestAnimationFrame(() => {
      setIsDark(activeDark);
      setMounted(true);
    });
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("neu-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("neu-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-md border border-border bg-surface text-text-muted opacity-50" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface text-text-muted hover:text-text-primary hover:border-border-hover transition-subtle cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <FiSun className="w-4 h-4 text-accent" /> : <FiMoon className="w-4 h-4 text-text-muted" />}
    </button>
  );
}
