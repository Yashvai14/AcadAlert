"use client";

import { CalendarDays, CheckCircle2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiClient,
  type Attendance,
  type Student,
} from "../../lib/api";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([apiClient.getStudents(), apiClient.getAttendance()])
      .then(([studentsRes, attendanceRes]) => {
        if (!active) return;
        setStudents(studentsRes);
        setAttendance(attendanceRes);
      })
      .catch(() => {
        if (!active) return;
        setStudents([]);
        setAttendance([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !date) {
      setError("Please select a student and date.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await apiClient.createAttendance({
        student_id: selectedStudentId,
        date,
        status,
      });
      setAttendance((prev) => [created, ...prev]);
    } catch {
      setError("Unable to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const attendanceRows = useMemo(
    () =>
      attendance
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((a) => {
          const student = students.find((s) => s.id === a.student_id);
          return {
            ...a,
            studentName: student?.name ?? "Unknown",
            rollNumber: student?.roll_number ?? "-",
          };
        }),
    [attendance, students]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Attendance
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Daily check-in
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Log daily presence for each student. Attendance feeds directly into
            the risk prediction model.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-slate-100">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Log attendance
              </p>
              <p className="text-sm text-slate-100">
                Quickly mark present or absent for a given date.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 text-xs md:grid-cols-4"
        >
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-300">
              Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.roll_number}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Present" | "Absent")
              }
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Attendance entries are immutable to keep the audit trail clean.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save entry"}
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-2 text-[11px] text-rose-400">
            {error}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Attendance history
            </p>
            <p className="text-sm text-slate-100">
              Recent check-ins across the cohort
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40">
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 z-10 bg-slate-950/90 text-[11px] uppercase tracking-[0.16em] text-slate-400 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Roll</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : attendanceRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      No attendance entries yet. Log your first check-in above.
                    </td>
                  </tr>
                ) : (
                  attendanceRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-slate-800/80 hover:bg-slate-900/70"
                    >
                      <td className="px-4 py-3 text-slate-100">
                        {row.studentName}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {row.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            row.status === "Present"
                              ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30"
                              : "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30"
                          }`}
                        >
                          {row.status}
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
    </div>
  );
}

