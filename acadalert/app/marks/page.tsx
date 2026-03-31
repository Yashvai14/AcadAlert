"use client";

import { ClipboardList, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiClient, type Mark, type Student } from "../../lib/api";

export default function MarksPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([apiClient.getStudents(), apiClient.getMarks()])
      .then(([studentsRes, marksRes]) => {
        if (!active) return;
        setStudents(studentsRes);
        setMarks(marksRes);
      })
      .catch(() => {
        if (!active) return;
        setStudents([]);
        setMarks([]);
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
    if (!studentId || !subject.trim() || !marksObtained || !maxMarks) {
      setError("Fill in all fields before saving.");
      return;
    }
    const marksValue = Number(marksObtained);
    const maxValue = Number(maxMarks);
    if (Number.isNaN(marksValue) || Number.isNaN(maxValue) || maxValue <= 0) {
      setError("Enter valid numeric values for marks.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await apiClient.createMark({
        student_id: studentId,
        subject: subject.trim(),
        marks: marksValue,
        max_marks: maxValue,
      });
      setMarks((prev) => [created, ...prev]);
      setSubject("");
      setMarksObtained("");
      setMaxMarks("");
    } catch {
      setError("Unable to save marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const markRows = useMemo(
    () =>
      marks
        .slice()
        .sort((a, b) => b.id.localeCompare(a.id))
        .map((m) => {
          const student = students.find((s) => s.id === m.student_id);
          const percentage = (m.marks / m.max_marks) * 100;
          return {
            ...m,
            studentName: student?.name ?? "Unknown",
            rollNumber: student?.roll_number ?? "-",
            percentage,
          };
        }),
    [marks, students]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Marks
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Internal assessment
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Capture internal marks across subjects. These scores combine with
            attendance and assignment delays to estimate risk.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-slate-100">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Enter marks
            </p>
            <p className="text-sm text-slate-100">
              Record internal assessment scores for each subject.
            </p>
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

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Data Structures"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Marks / Max
            </label>
            <div className="flex gap-2">
              <input
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. 42"
              />
              <input
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Marks are stored per subject and student. You can add multiple
              entries for the same student across tests.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save marks"}
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
              Marks history
            </p>
            <p className="text-sm text-slate-100">
              Recent internal scores by subject
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
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Marks
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Loading marks...
                    </td>
                  </tr>
                ) : markRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      No marks recorded yet. Add assessments using the form
                      above.
                    </td>
                  </tr>
                ) : (
                  markRows.map((row) => (
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
                        {row.subject}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        {row.marks} / {row.max_marks}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        {row.percentage.toFixed(1)}%
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

