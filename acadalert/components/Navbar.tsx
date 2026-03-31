"use client";

import { Bell, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("acadalert-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
      .matches;
    const initial = (stored as "light" | "dark" | null) ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("acadalert-theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  };

  return { theme, toggle };
}

export function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Student Academic Risk
            </span>
            <h1 className="text-sm font-semibold text-slate-900 md:text-base dark:text-slate-100">
              Prediction & Early Alert System
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100 dark:bg-slate-100 dark:text-slate-900">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Dr. Faculty
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Computer Science · Faculty
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

