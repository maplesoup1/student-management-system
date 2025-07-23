// API Types matching backend DTOs
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: number;
  username: string;
  email?: string;
  password?: string; // Make password optional for DTOs where it's not always present
  role: Role;
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
  day?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  room: string;
}

export interface Schedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
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