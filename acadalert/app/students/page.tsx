"use client";

import { Plus, Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { StudentTable, type StudentRow } from "../../components/StudentTable";
import { apiClient, type Student } from "../../lib/api";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState<"" | "Low" | "Medium" | "High">(
    ""
  );
  const [formOpen, setFormOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getStudents()
      .then((data) => {
        if (!active) return;
        setStudents(data);
      })
      .catch(() => {
        if (!active) return;
        setStudents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const tableRows: StudentRow[] = useMemo(
    () =>
      students
        .filter((s) => {
          const matchesSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(search.toLowerCase());
          const matchesRisk = !filterRisk || s.risk_level === filterRisk;
          return matchesSearch && matchesRisk;
        })
        .map((s) => ({
          id: s.id,
          name: s.name,
          rollNumber: s.roll_number,
          department: s.department,
          attendance: s.attendance_percentage ?? 0,
          averageMarks: s.average_marks ?? 0,
          riskLevel: s.risk_level,
        })),
    [students, search, filterRisk]
  );

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roll.trim() || !department.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const created = await apiClient.createStudent({
        name: name.trim(),
        roll_number: roll.trim(),
        department: department.trim(),
      });
      setStudents((prev) => [created, ...prev]);
      setName("");
      setRoll("");
      setDepartment("");
      setFormOpen(false);
    } catch {
      setError("Unable to create student. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs">
        <Search className="h-3.5 w-3.5 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or roll..."
          className="w-40 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none md:w-56"
        />
      </div>
      <select
        value={filterRisk}
        onChange={(e) =>
          setFilterRisk(e.target.value as "" | "Low" | "Medium" | "High")
        }
        className="h-8 rounded-full border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-100 focus:outline-none"
      >
        <option value="">Risk: All</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Student
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Students
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Cohort directory
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Search students, review academic health, and register new profiles
            to feed into the risk prediction pipeline.
          </p>
        </div>
      </div>

      {formOpen && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Add student
              </p>
              <p className="text-sm text-slate-100">
                Capture basic academic profile details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-full px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800/80"
            >
              Close
            </button>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-3 text-xs md:grid-cols-3"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Student name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Ananya Sharma"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Roll number
              </label>
              <input
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. CS23-041"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Department
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-500">
                Students added here will automatically appear in attendance,
                marks, and assignment dropdowns.
              </div>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {creating ? "Saving..." : "Save student"}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-2 text-[11px] text-rose-400">
              {error}
            </p>
          )}
        </section>
      )}

      <StudentTable
        data={loading ? [] : tableRows}
        toolbar={toolbar}
        emptyLabel={
          loading
            ? "Loading students..."
            : "No students found. Add your first student to get started."
        }
      />
    </div>
  );
}

