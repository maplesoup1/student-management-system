import axios from 'axios';
import { enrollmentAPI, classAPI, studentAPI, teacherAPI } from '../api';
import { EnrollmentDto } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollmentAPI', () => {
    describe('getAll', () => {
      test('should fetch all enrollments', async () => {
        const mockEnrollments = [
          {
            id: 1,
            studentId: 1,
            classId: 1,
            studentName: 'Alice Chen',
            studentEmail: 'alice.chen@example.com',
            classTitle: 'Advanced Mathematics',
            teacherName: 'John Smith',
            day: 'monday',
            startTime: '08:00',
            endTime: '10:00',
            room: 'A203'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockEnrollments });

        const result = await enrollmentAPI.getAll();

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/enrollments');
        expect(result.data).toEqual(mockEnrollments);
      });

      test('should handle API errors', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.get.mockRejectedValue(new Error(errorMessage));

        await expect(enrollmentAPI.getAll()).rejects.toThrow(errorMessage);
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/enrollments');
      });
    });

    describe('getById', () => {
      test('should fetch enrollment by ID', async () => {
        const enrollmentId = 1;
        const mockEnrollment = {
          id: enrollmentId,
          studentId: 1,
          classId: 1,
          studentName: 'Alice Chen',
          day: 'monday',
          startTime: '08:00',
          endTime: '10:00'
        };

        mockedAxios.get.mockResolvedValue({ data: mockEnrollment });

        const result = await enrollmentAPI.getById(enrollmentId);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/enrollments/${enrollmentId}`);
        expect(result.data).toEqual(mockEnrollment);
      });
    });

    describe('getByStudent', () => {
      test('should fetch enrollments by student ID', async () => {
        const studentId = 1;
        const mockEnrollments = [
          {
            id: 1,
            studentId: studentId,
            classId: 1,
            day: 'monday',
            startTime: '08:00',
            endTime: '10:00'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockEnrollments });

        const result = await enrollmentAPI.getByStudent(studentId);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/enrollments/student/${studentId}`);
        expect(result.data).toEqual(mockEnrollments);
      });
    });

    describe('getByClass', () => {
      test('should fetch enrollments by class ID', async () => {
        const classId = 1;
        const mockEnrollments = [
          {
            id: 1,
            studentId: 1,
            classId: classId,
            day: 'monday',
            startTime: '08:00',
            endTime: '10:00'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockEnrollments });

        const result = await enrollmentAPI.getByClass(classId);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/enrollments/class/${classId}`);
        expect(result.data).toEqual(mockEnrollments);
      });
    });

    describe('create', () => {
      test('should create new enrollment', async () => {
        const newEnrollment: EnrollmentDto = {
          id: null,
          studentId: 1,
          classId: 1,
          studentName: 'Alice Chen',
          studentEmail: 'alice.chen@example.com',
          classTitle: 'Advanced Mathematics',
          teacherName: 'John Smith',
          day: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          room: 'A203'
        };

        const createdEnrollment = { ...newEnrollment, id: 1 };
        mockedAxios.post.mockResolvedValue({ data: createdEnrollment });

        const result = await enrollmentAPI.create(newEnrollment);

        expect(mockedAxios.post).toHaveBeenCalledWith('/api/enrollments', newEnrollment);
        expect(result.data).toEqual(createdEnrollment);
      });

      test('should handle enrollment creation conflicts', async () => {
        const enrollment: EnrollmentDto = {
          id: null,
          studentId: 1,
          classId: 1,
          studentName: 'Alice Chen',
          studentEmail: 'alice.chen@example.com',
          classTitle: 'Advanced Mathematics',
          teacherName: 'John Smith',
          day: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          room: 'A203'
        };

        const conflictError = {
          response: {
            status: 409,
            data: 'Schedule conflict: Student has an overlapping time slot on monday'
          }
        };

        mockedAxios.post.mockRejectedValue(conflictError);

        await expect(enrollmentAPI.create(enrollment)).rejects.toEqual(conflictError);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/enrollments', enrollment);
      });

      test('should handle duplicate enrollment errors', async () => {
        const enrollment: EnrollmentDto = {
          id: null,
          studentId: 1,
          classId: 1,
          studentName: 'Alice Chen',
          studentEmail: 'alice.chen@example.com',
          classTitle: 'Advanced Mathematics',
          teacherName: 'John Smith',
          day: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          room: 'A203'
        };

        const duplicateError = {
          response: {
            status: 409,
            data: 'Student already enrolled in this exact time slot'
          }
        };

        mockedAxios.post.mockRejectedValue(duplicateError);

        await expect(enrollmentAPI.create(enrollment)).rejects.toEqual(duplicateError);
      });
    });

    describe('delete', () => {
      test('should delete enrollment by ID', async () => {
        const enrollmentId = 1;
        const successMessage = 'Enrollment deleted successfully';

        mockedAxios.delete.mockResolvedValue({ data: successMessage });

        const result = await enrollmentAPI.delete(enrollmentId);

        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/enrollments/${enrollmentId}`);
        expect(result.data).toEqual(successMessage);
      });

      test('should handle deletion of non-existent enrollment', async () => {
        const enrollmentId = 999;
        const notFoundError = {
          response: {
            status: 404
          }
        };

        mockedAxios.delete.mockRejectedValue(notFoundError);

        await expect(enrollmentAPI.delete(enrollmentId)).rejects.toEqual(notFoundError);
        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/enrollments/${enrollmentId}`);
      });
    });
  });

  describe('classAPI', () => {
    describe('getAll', () => {
      test('should fetch all classes', async () => {
        const mockClasses = [
          {
            id: 1,
            title: 'Advanced Mathematics',
            teacherId: 1,
            subject: 'Mathematics',
            schedule: {
              monday: [{ start: '08:00', end: '10:00', room: 'A203' }]
            }
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockClasses });

        const result = await classAPI.getAll();

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/classes');
        expect(result.data).toEqual(mockClasses);
      });
    });

    describe('getByTeacher', () => {
      test('should fetch classes by teacher ID', async () => {
        const teacherId = 1;
        const mockClasses = [
          {
            id: 1,
            title: 'Advanced Mathematics',
            teacherId: teacherId,
            subject: 'Mathematics'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockClasses });

        const result = await classAPI.getByTeacher(teacherId);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/api/teachers/${teacherId}/classes`);
        expect(result.data).toEqual(mockClasses);
      });
    });

    describe('update', () => {
      test('should update class', async () => {
        const classId = 1;
        const updatedClass = {
          id: classId,
          title: 'Updated Mathematics',
          teacherId: 1,
          subject: 'Mathematics',
          schedule: {
            monday: [{ start: '09:00', end: '11:00', room: 'B203' }]
          }
        };

        mockedAxios.put.mockResolvedValue({ data: updatedClass });

        const result = await classAPI.update(classId, updatedClass);

        expect(mockedAxios.put).toHaveBeenCalledWith(`/api/classes/${classId}`, updatedClass);
        expect(result.data).toEqual(updatedClass);
      });
    });

    describe('delete', () => {
      test('should delete class by ID', async () => {
        const classId = 1;
        const successMessage = 'Class deleted successfully';

        mockedAxios.delete.mockResolvedValue({ data: successMessage });

        const result = await classAPI.delete(classId);

        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/classes/${classId}`);
        expect(result.data).toEqual(successMessage);
      });
    });
  });

  describe('studentAPI', () => {
    describe('getAll', () => {
      test('should fetch all students', async () => {
        const mockStudents = [
          {
            id: 1,
            name: 'Alice Chen',
            email: 'alice.chen@example.com',
            userId: 1
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockStudents });

        const result = await studentAPI.getAll();

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/students');
        expect(result.data).toEqual(mockStudents);
      });
    });
  });

  describe('teacherAPI', () => {
    describe('getAll', () => {
      test('should fetch all teachers', async () => {
        const mockTeachers = [
          {
            id: 1,
            name: 'John Smith',
            subject: 'Mathematics',
            userId: 2,
            username: 'john_smith'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockTeachers });

        const result = await teacherAPI.getAll();

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/teachers');
        expect(result.data).toEqual(mockTeachers);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(enrollmentAPI.getAll()).rejects.toThrow('Network Error');
    });

    test('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 500,
          data: 'Internal Server Error'
        }
      };

      mockedAxios.get.mockRejectedValue(httpError);

      await expect(enrollmentAPI.getAll()).rejects.toEqual(httpError);
    });

    test('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(enrollmentAPI.getAll()).rejects.toEqual(timeoutError);
    });
  });

  describe('API Configuration', () => {
    test('should use correct base URL for all requests', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await enrollmentAPI.getAll();
      await classAPI.getAll();
      await studentAPI.getAll();
      await teacherAPI.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/enrollments');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/classes');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/students');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/teachers');
    });
  });
});