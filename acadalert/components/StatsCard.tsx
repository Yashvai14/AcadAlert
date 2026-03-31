"use client";

import { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string;
  trendLabel?: string;
  trendColor?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
};

export function StatsCard({
  label,
  value,
  trendLabel,
  trendColor = "neutral",
  icon,
}: StatsCardProps) {
  const trendStyles =
    trendColor === "positive"
      ? "text-emerald-400 bg-emerald-500/10"
      : trendColor === "negative"
        ? "text-rose-400 bg-rose-500/10"
        : "text-slate-300 bg-slate-500/10";

  return (
    <section className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {icon}
          </div>
        )}
      </div>

      {trendLabel && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${trendStyles}`}
          >
            {trendLabel}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Last 7 days
          </span>
        </div>
      )}
    </section>
  );
}

