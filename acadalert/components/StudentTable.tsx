"use client";

import { ReactNode } from "react";

export type StudentRow = {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  attendance: number;
  averageMarks: number;
  riskLevel: "Low" | "Medium" | "High";
};

type StudentTableProps = {
  data: StudentRow[];
  toolbar?: ReactNode;
  emptyLabel?: string;
};

const riskColors: Record<StudentRow["riskLevel"], string> = {
  Low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30",
  Medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30",
  High: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30",
};

export function StudentTable({
  data,
  toolbar,
  emptyLabel = "No students found.",
}: StudentTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Students
          </p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Cohort overview and risk levels
          </p>
        </div>
        {toolbar}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500 backdrop-blur dark:bg-slate-950/90 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Roll</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium text-right">
                  Attendance %
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Avg Marks
                </th>
                <th className="px-4 py-3 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-xs text-slate-500 dark:text-slate-500"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 text-xs hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {row.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-500">
                          ID: {row.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.rollNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.department}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                      {row.attendance.toFixed(1)}%
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                      {row.averageMarks.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${riskColors[row.riskLevel]}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              row.riskLevel === "Low"
                                ? "#22c55e"
                                : row.riskLevel === "Medium"
                                  ? "#eab308"
                                  : "#f97373",
                          }}
                        />
                        {row.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

