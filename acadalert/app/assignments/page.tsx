"use client";

import { Clock3, FileCheck2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiClient,
  type Assignment,
  type Student,
} from "../../lib/api";

export default function AssignmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [status, setStatus] = useState<"On Time" | "Late">("On Time");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([apiClient.getStudents(), apiClient.getAssignments()])
      .then(([studentsRes, assignmentsRes]) => {
        if (!active) return;
        setStudents(studentsRes);
        setAssignments(assignmentsRes);
      })
      .catch(() => {
        if (!active) return;
        setStudents([]);
        setAssignments([]);
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
    if (!studentId || !title.trim() || !deadline || !submissionDate) {
      setError("Fill in all fields before saving.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await apiClient.createAssignment({
        student_id: studentId,
        assignment_title: title.trim(),
        deadline,
        submission_date: submissionDate,
        status,
      });
      setAssignments((prev) => [created, ...prev]);
      setTitle("");
      setDeadline("");
      setSubmissionDate("");
      setStatus("On Time");
    } catch {
      setError("Unable to save assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const assignmentRows = useMemo(
    () =>
      assignments
        .slice()
        .sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""))
        .map((a) => {
          const student = students.find((s) => s.id === a.student_id);
          return {
            ...a,
            studentName: student?.name ?? "Unknown",
            rollNumber: student?.roll_number ?? "-",
          };
        }),
    [assignments, students]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Assignments
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Submission tracker
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Track assignment deadlines and submission behavior. Late patterns
            are a strong indicator for academic risk.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-slate-100">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Log assignment
            </p>
            <p className="text-sm text-slate-100">
              Capture deadlines and actual submission dates.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 text-xs md:grid-cols-5"
        >
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-300">
              Student
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
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

          <div className="space-y-1 md:col-span-3">
            <label className="text-[11px] font-medium text-slate-300">
              Assignment title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. ML Project Proposal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Submission date
            </label>
            <input
              type="date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
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
                setStatus(e.target.value as "On Time" | "Late")
              }
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="On Time">On Time</option>
              <option value="Late">Late</option>
            </select>
          </div>

          <div className="md:col-span-5 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Late submissions automatically increase each student&apos;s
              assignment delay count in the risk model.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save assignment"}
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
              Assignment history
            </p>
            <p className="text-sm text-slate-100">
              Recent submissions and delay patterns
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
                  <th className="px-4 py-3 font-medium">Assignment</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Submission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Loading assignments...
                    </td>
                  </tr>
                ) : assignmentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      No assignments recorded yet. Log the first submission
                      above.
                    </td>
                  </tr>
                ) : (
                  assignmentRows.map((row) => (
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
                        {row.assignment_title}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {row.deadline
                          ? new Date(row.deadline).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {row.submission_date
                          ? new Date(row.submission_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            row.status === "On Time"
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

