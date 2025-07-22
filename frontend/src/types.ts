// API Types matching backend DTOs
export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface Student {
  id: number;
  name: string;
  email: string;
  userId?: number;
  username?: string;
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  userId?: number;
  username?: string;
}

export interface Class {
  id: number;
  title: string;
  schedule: string;
  subject?: string;
  teacherId: number;
  teacherName?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  classId: number;
  studentName?: string;
  studentEmail?: string;
  classTitle?: string;
  teacherName?: string;
}

export interface Schedule {
  days: string[];
  time: string;
  room: string;
  duration?: string;
}

export interface TeacherDashboard {
  teacherId: number;
  teacherName: string;
  subject: string;
  classes: ClassSummary[];
  totalStudents: number;
  totalClasses: number;
}

export interface ClassSummary {
  id: number;
  title: string;
  schedule: string;
  enrolledStudents: number;
  teacherName?: string;
}