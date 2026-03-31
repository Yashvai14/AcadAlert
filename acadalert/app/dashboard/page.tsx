"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart2, Users } from "lucide-react";
import { RiskChart } from "../../components/RiskChart";
import { StatsCard } from "../../components/StatsCard";
import { apiClient, Student, RiskPrediction } from "../../lib/api";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, predictionData] = await Promise.all([
          apiClient.getStudents(),
          apiClient.getRiskPredictions(),
        ]);
        setStudents(studentData);
        setPredictions(predictionData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  // Calculate Stats
  const totalStudents = students.length;
  
  const totalAttendance = students.reduce((acc, s) => acc + s.attendance_percentage, 0);
  const avgAttendance = totalStudents > 0 ? (totalAttendance / totalStudents).toFixed(1) + "%" : "0%";

  const totalMarks = students.reduce((acc, s) => acc + s.average_marks, 0);
  const avgMarks = totalStudents > 0 ? (totalMarks / totalStudents).toFixed(1) : "0";

  const highRiskStudents = predictions.filter(p => p.predicted_risk === "High").length;

  // Chart Mocks mapped from actuals (Real integration using overall distributions)
  const lowRisk = predictions.filter(p => p.predicted_risk === "Low").length;
  const mediumRisk = predictions.filter(p => p.predicted_risk === "Medium").length;
  
  const riskDistribution = [
    { level: "Low", count: lowRisk },
    { level: "Medium", count: mediumRisk },
    { level: "High", count: highRiskStudents },
  ];

  // We are keeping a static trend mock here for UI presentation unless we track timeseries in DB
  const mockAttendanceTrend = [
    { week: "W1", attendance: 86 },
    { week: "W2", attendance: 82 },
    { week: "W3", attendance: 88 },
    { week: "W4", attendance: 84 },
    { week: "W5", attendance: 89 },
    { week: "W6", attendance: parseFloat(avgAttendance) || 91 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Overview
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Faculty dashboard
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            See a quick summary of students, attendance, marks, and current risk levels powered by ML predictions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total students"
          value={totalStudents.toString()}
          trendLabel="Current DB metrics"
          trendColor="neutral"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          label="Average attendance"
          value={avgAttendance}
          trendLabel="Latest calculations"
          trendColor="neutral"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatsCard
          label="Average internal marks"
          value={avgMarks}
          trendLabel="Latest calculations"
          trendColor="neutral"
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <StatsCard
          label="High-risk students"
          value={highRiskStudents.toString()}
          trendLabel="Flagged by AI Model"
          trendColor={highRiskStudents > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className={`h-4 w-4 ${highRiskStudents > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />}
        />
      </div>

      <RiskChart
        riskDistribution={riskDistribution}
        attendanceTrend={mockAttendanceTrend}
      />
    </div>
  );
}
