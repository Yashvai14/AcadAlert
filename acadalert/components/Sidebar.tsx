"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  NotebookPen,
  FileText,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck2 },
  { href: "/marks", label: "Marks", icon: NotebookPen },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/risk-analysis", label: "Risk Analysis", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-slate-200 bg-white px-4 py-5 text-slate-800 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 flex items-center gap-2 px-1">
        <span className="text-base font-semibold tracking-tight">
          Academic Risk
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
          Beta
        </span>
      </div>

      <nav className="flex-1 space-y-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                isActive
                  ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 dark:text-slate-400",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

