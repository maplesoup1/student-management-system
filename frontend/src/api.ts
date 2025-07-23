import axios from 'axios';
import { Student, Teacher, Class, Enrollment, User } from './types';

interface LoginCredentials {
    username: string;
    password: string;
}

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else if (error.response && error.response.data && error.response.data.validationErrors) {
            const errors = Object.values(error.response.data.validationErrors).join(', ');
            throw new Error(errors as string);
        }
        throw error;
    }
};

export const register = async (user: Omit<User, 'id'>): Promise<User> => {
    try {
        const response = await api.post('/auth/register', user);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else if (error.response && error.response.data && error.response.data.validationErrors) {
            const errors = Object.values(error.response.data.validationErrors).join(', ');
            throw new Error(errors as string);
        }
        throw error;
    }
};

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
  create: (data: { 
    studentId: number; 
    classId: number;
    day?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
  }) => api.post<Enrollment>('/enrollments', data),
  delete: (id: number) => api.delete(`/enrollments/${id}`)
};

export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: Omit<User, 'id'>) => api.post<User>('/users', data),
  updateRole: (id: number, role: string) => api.put<User>(`/users/${id}/role`, { role })
};

export const conflictAPI = {
  checkRoom: (data: {
    room: string;
    day: string;
    startTime: string;
    endTime: string;
    excludeClassId?: number;
  }) => api.post<{
    hasConflict: boolean;
    conflicts: Array<{
      classId: number;
      classTitle: string;
      teacherName: string;
    }>;
    message: string;
  }>('/conflicts/check-room', data),
  
  checkTeacher: (data: {
    teacherId: number;
    day: string;
    startTime: string;
    endTime: string;
    excludeClassId?: number;
  }) => api.post<{
    hasConflict: boolean;
    conflicts: Array<{
      classId: number;
      classTitle: string;
    }>;
    message: string;
  }>('/conflicts/check-teacher', data)
};