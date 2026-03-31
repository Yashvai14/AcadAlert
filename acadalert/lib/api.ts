import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

export type Student = {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  attendance_percentage: number;
  average_marks: number;
  risk_level: "Low" | "Medium" | "High";
};

export type Attendance = {
  id: string;
  student_id: string;
  date: string;
  status: "Present" | "Absent";
};

export type Mark = {
  id: string;
  student_id: string;
  subject: string;
  marks: number;
  max_marks: number;
};

export type Assignment = {
  id: string;
  student_id: string;
  assignment_title: string;
  deadline: string;
  submission_date: string | null;
  status: "On Time" | "Late" | "Pending";
};

export type RiskPrediction = {
  student_id: string;
  student_name: string;
  attendance_percentage: number;
  average_marks: number;
  assignment_delay_count: number;
  predicted_risk: "Low" | "Medium" | "High";
};

export const apiClient = {
  async getStudents(): Promise<Student[]> {
    const res = await api.get<Student[]>("/students");
    return res.data;
  },

  async createStudent(payload: {
    name: string;
    roll_number: string;
    department: string;
  }): Promise<Student> {
    const res = await api.post<Student>("/students", payload);
    return res.data;
  },

  async getAttendance(): Promise<Attendance[]> {
    const res = await api.get<Attendance[]>("/attendance");
    return res.data;
  },

  async createAttendance(payload: {
    student_id: string;
    date: string;
    status: "Present" | "Absent";
  }): Promise<Attendance> {
    const res = await api.post<Attendance>("/attendance", payload);
    return res.data;
  },

  async getMarks(): Promise<Mark[]> {
    const res = await api.get<Mark[]>("/marks");
    return res.data;
  },

  async createMark(payload: {
    student_id: string;
    subject: string;
    marks: number;
    max_marks: number;
  }): Promise<Mark> {
    const res = await api.post<Mark>("/marks", payload);
    return res.data;
  },

  async getAssignments(): Promise<Assignment[]> {
    const res = await api.get<Assignment[]>("/assignments");
    return res.data;
  },

  async createAssignment(payload: {
    student_id: string;
    assignment_title: string;
    deadline: string;
    submission_date: string | null;
    status: "On Time" | "Late" | "Pending";
  }): Promise<Assignment> {
    const res = await api.post<Assignment>("/assignments", payload);
    return res.data;
  },

  async getRiskPredictions(): Promise<RiskPrediction[]> {
    const res = await api.get<RiskPrediction[]>("/risk-predictions");
    return res.data;
  },

  async getStudentInsights(studentId: string): Promise<{ student_id: string; insights: { reasons: string[]; action_plan: string[] } }> {
    const res = await api.get<{ student_id: string; insights: { reasons: string[]; action_plan: string[] } }>(`/students/${studentId}/insights`);
    return res.data;
  },
};


