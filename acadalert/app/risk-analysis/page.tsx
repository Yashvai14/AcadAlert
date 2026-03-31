"use client";

import { AlertTriangle, BarChart3, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { apiClient, type RiskPrediction } from "../../lib/api";

type RiskSummary = {
  low: number;
  medium: number;
  high: number;
};

type AIInsight = {
  reasons: string[];
  action_plan: string[];
};

export default function RiskAnalysisPage() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Profile State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, AIInsight>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getRiskPredictions()
      .then((data) => {
        if (!active) return;
        setPredictions(data);
      })
      .catch(() => {
        if (!active) return;
        setPredictions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const summary: RiskSummary = useMemo(() => {
    return predictions.reduce(
      (acc, p) => {
        if (p.predicted_risk === "Low") acc.low += 1;
        if (p.predicted_risk === "Medium") acc.medium += 1;
        if (p.predicted_risk === "High") acc.high += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );
  }, [predictions]);

  const total = summary.low + summary.medium + summary.high || 1;

  const riskLevel =
    summary.high > 0
      ? "High"
      : summary.medium > 0
        ? "Medium"
        : "Low";

  const riskChipClasses =
    riskLevel === "High"
      ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/40"
      : riskLevel === "Medium"
        ? "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/40"
        : "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/40";

  const topRiskStudents = useMemo(
    () =>
      predictions
        .slice()
        .sort((a, b) => {
          const order: Record<RiskPrediction["predicted_risk"], number> = {
            High: 3,
            Medium: 2,
            Low: 1,
          };
          return order[b.predicted_risk] - order[a.predicted_risk];
        })
        .slice(0, 10),
    [predictions]
  );

  const fetchInsight = async (studentId: string) => {
    if (expandedId === studentId) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(studentId);
    
    if (insights[studentId]) return; // Already fetched
    
    setLoadingInsights(prev => ({ ...prev, [studentId]: true }));
    try {
      const result = await apiClient.getStudentInsights(studentId);
      setInsights(prev => ({ ...prev, [studentId]: result.insights }));
    } catch (err) {
      setInsights(prev => ({ ...prev, [studentId]: { reasons: ["Could not load AI insight."], action_plan: ["Please ensure Ollama is running correctly."] } }));
    } finally {
      setLoadingInsights(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Risk analysis
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Prediction insights
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Combined view of attendance, marks, and assignment behavior for
            early detection of at-risk students.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${riskChipClasses}`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Overall cohort risk: {riskLevel}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Risk level
              </p>
              <p className="text-sm font-medium text-slate-100">
                Current prediction snapshot
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/90 text-slate-100">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Low risk</span>
              <span className="font-medium text-emerald-300">
                {summary.low}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="bg-emerald-500"
                style={{ width: `${(summary.low / total) * 100}%` }}
              />
              <div
                className="bg-amber-400"
                style={{ width: `${(summary.medium / total) * 100}%` }}
              />
              <div
                className="bg-rose-500"
                style={{ width: `${(summary.high / total) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Medium risk</span>
              <span className="font-medium text-amber-300">
                {summary.medium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>High risk</span>
              <span className="font-medium text-rose-300">
                {summary.high}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Feature impact
              </p>
              <p className="text-sm font-medium text-slate-100">
                Drivers of high risk
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/90 text-slate-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2">
              <span>Attendance below 75%</span>
              <span className="text-emerald-300">High impact</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2">
              <span>Internal marks below 60</span>
              <span className="text-emerald-300">High impact</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2">
              <span>Assignment delays &gt; 2</span>
              <span className="text-emerald-300">Medium impact</span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Faculty actions
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">
            Suggested interventions
          </p>
          <ul className="mt-3 space-y-2">
            <li className="rounded-xl bg-slate-950/60 px-3 py-2">
              Schedule a quick advisory meeting with the top 5 high-risk
              students.
            </li>
            <li className="rounded-xl bg-slate-950/60 px-3 py-2">
              Share attendance and marks summary with class mentors weekly.
            </li>
            <li className="rounded-xl bg-slate-950/60 px-3 py-2">
              Encourage early assignment submissions by signaling deadlines
              clearly in class.
            </li>
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Top risk students & AI Insights
            </p>
            <p className="text-sm text-slate-100">
              Expand a student to get AI-generated reasons and action plans from Ollama.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40">
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 z-10 bg-slate-950/90 text-[11px] uppercase tracking-[0.16em] text-slate-400 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Attendance %
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Avg Marks
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Assignment delays
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Predicted risk
                  </th>
                  <th className="px-4 py-3 font-medium text-center">
                    AI Profile
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      Loading risk predictions...
                    </td>
                  </tr>
                ) : topRiskStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-xs text-slate-500"
                    >
                      No risk predictions available yet.
                    </td>
                  </tr>
                ) : (
                  topRiskStudents.map((row) => {
                    const riskClasses =
                      row.predicted_risk === "Low"
                        ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30"
                        : row.predicted_risk === "Medium"
                          ? "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30"
                          : "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30";
                          
                    const isExpanded = expandedId === row.student_id;
                    const insightData = insights[row.student_id];
                    const isInsightLoading = loadingInsights[row.student_id];

                    return (
                      <React.Fragment key={row.student_id}>
                        <tr
                          className={`border-t border-slate-800/80 transition-colors hover:bg-slate-900/70 ${isExpanded ? 'bg-slate-900/50' : ''}`}
                        >
                          <td className="px-4 py-3 text-slate-100 font-medium">
                            {row.student_name}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-100">
                            {row.attendance_percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-slate-100">
                            {row.average_marks.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-100">
                            {row.assignment_delay_count}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center justify-end gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${riskClasses}`}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    row.predicted_risk === "Low"
                                      ? "#22c55e"
                                      : row.predicted_risk === "Medium"
                                        ? "#eab308"
                                        : "#f97373",
                                }}
                              />
                              {row.predicted_risk}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => fetchInsight(row.student_id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-medium text-indigo-300 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500/20"
                            >
                              <Sparkles className="h-3 w-3" />
                              Analyze {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded AI Profile Row */}
                        {isExpanded && (
                          <tr className="bg-slate-900/40 border-b border-slate-800/50">
                            <td colSpan={6} className="px-4 py-4">
                               <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-5">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-4 w-4 text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-indigo-100">AI Risk Assessment: {row.student_name}</h3>
                                  </div>
                                  
                                  {isInsightLoading && (
                                    <div className="animate-pulse flex flex-col gap-3">
                                      <div className="h-2 w-3/4 rounded bg-slate-800"></div>
                                      <div className="h-2 w-1/2 rounded bg-slate-800"></div>
                                      <div className="h-2 w-2/3 rounded bg-slate-800"></div>
                                      <div className="mt-2 text-[10px] text-slate-500">Contacting local Ollama model...</div>
                                    </div>
                                  )}
                                  
                                  {!isInsightLoading && insightData && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-[11px] uppercase tracking-wider text-rose-300/80 mb-2 font-medium">Why they are at risk</p>
                                        <ul className="space-y-2">
                                          {insightData.reasons?.map((r, i) => (
                                            <li key={i} className="flex gap-2 text-slate-300 text-xs">
                                              <span className="text-rose-400 mt-0.5">•</span>
                                              <span>{r}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 mb-2 font-medium">Recommended Action Plan</p>
                                        <ul className="space-y-2">
                                          {insightData.action_plan?.map((a, i) => (
                                            <li key={i} className="flex gap-2 text-slate-300 text-xs">
                                              <span className="text-emerald-400 mt-0.5">→</span>
                                              <span>{a}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
