import axios from 'axios';
import { Student, Teacher, Class, Enrollment, User } from './types';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export const studentAPI = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  create: (data: Omit<Student, 'id'>) => api.post<Student>('/students', data),
  update: (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`)
};

export const teacherAPI = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  create: (data: Omit<Teacher, 'id'>) => api.post<Teacher>('/teachers', data),
  update: (id: number, data: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, data),
  delete: (id: number) => api.delete(`/teachers/${id}`)
};

export const classAPI = {
  getAll: () => api.get<Class[]>('/classes'),
  getById: (id: number) => api.get<Class>(`/classes/${id}`),
  getByTeacher: (teacherId: number) => api.get<Class[]>(`/classes/teacher/${teacherId}`),
  create: (data: Omit<Class, 'id'>) => api.post<Class>('/classes', data),
  update: (id: number, data: Partial<Class>) => api.put<Class>(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`)
};

export const enrollmentAPI = {
  getAll: () => api.get<Enrollment[]>('/enrollments'),
  getByStudent: (studentId: number) => api.get<Enrollment[]>(`/enrollments/student/${studentId}`),
  getByClass: (classId: number) => api.get<Enrollment[]>(`/enrollments/class/${classId}`),
  create: (data: { studentId: number; classId: number }) => api.post<Enrollment>('/enrollments', data),
  delete: (id: number) => api.delete(`/enrollments/${id}`)
};

export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: Omit<User, 'id'>) => api.post<User>('/users', data)
};