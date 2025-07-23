import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MyEnrollments from '../MyEnrollments';
import * as api from '../../api';
import { Enrollment, Student, Class, Teacher } from '../../types';

// Mock the API modules
jest.mock('../../api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
});

const mockConfirm = window.confirm as jest.MockedFunction<typeof window.confirm>;

// Test data
const mockUser = { id: 1, username: 'alice_chen', role: 'STUDENT' };

const mockStudent: Student = {
  id: 1,
  name: 'Alice Chen',
  email: 'alice.chen@example.com',
  userId: 1
};

const mockTeacher: Teacher = {
  id: 1,
  name: 'John Smith',
  subject: 'Mathematics',
  userId: 2,
  username: 'john_smith'
};

const mockClass: Class = {
  id: 1,
  title: 'Advanced Mathematics',
  teacherId: 1,
  subject: 'Mathematics',
  schedule: {
    monday: [{ start: '08:00', end: '10:00', room: 'A203' }],
    tuesday: [],
    wednesday: [{ start: '08:00', end: '10:00', room: 'A203' }],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  }
};

const mockEnrollment: Enrollment = {
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
};

// Wrapper component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MyEnrollments Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    // Default API mocks
    mockApi.studentAPI.getAll.mockResolvedValue({ data: [mockStudent] });
    mockApi.classAPI.getAll.mockResolvedValue({ data: [mockClass] });
    mockApi.teacherAPI.getAll.mockResolvedValue({ data: [mockTeacher] });
    mockApi.enrollmentAPI.getByStudent.mockResolvedValue({ data: [mockEnrollment] });
  });

  describe('Rendering', () => {
    test('renders loading state initially', () => {
      renderWithRouter(<MyEnrollments />);
      expect(screen.getByText('Loading your enrollments...')).toBeInTheDocument();
    });

    test('renders enrollment data correctly', async () => {
      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('My Enrolled Courses')).toBeInTheDocument();
        expect(screen.getByText('1 courses enrolled')).toBeInTheDocument();
        expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument();
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('08:00-10:00')).toBeInTheDocument();
        expect(screen.getByText('A203')).toBeInTheDocument();
      });
    });

    test('renders empty state when no enrollments', async () => {
      mockApi.enrollmentAPI.getByStudent.mockResolvedValue({ data: [] });

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('You are not enrolled in any courses yet.')).toBeInTheDocument();
        expect(screen.getByText('Browse Available Courses')).toBeInTheDocument();
      });
    });

    test('renders error state when student not found', async () => {
      mockApi.studentAPI.getAll.mockResolvedValue({ data: [] });

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Student information not found. Please log in again.')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    test('calls correct APIs on component mount', async () => {
      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(mockApi.studentAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockApi.classAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockApi.teacherAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockApi.enrollmentAPI.getByStudent).toHaveBeenCalledWith(1);
      });
    });

    test('handles API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.studentAPI.getAll.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load your enrollments. Please try again.')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    test('refreshes data when refresh button is clicked', async () => {
      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(mockApi.studentAPI.getAll).toHaveBeenCalledTimes(2);
        expect(mockApi.enrollmentAPI.getByStudent).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Unenrollment', () => {
    test('shows confirmation dialog before unenrolling', async () => {
      mockConfirm.mockReturnValue(false);

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Unenroll')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Unenroll'));

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to unenroll from "Advanced Mathematics - monday 08:00-10:00"?'
      );
      expect(mockApi.enrollmentAPI.delete).not.toHaveBeenCalled();
    });

    test('unenrolls successfully when confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      mockApi.enrollmentAPI.delete.mockResolvedValue({});

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Unenroll')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Unenroll'));

      await waitFor(() => {
        expect(mockApi.enrollmentAPI.delete).toHaveBeenCalledWith(1);
        expect(screen.getByText('Successfully unenrolled from course')).toBeInTheDocument();
      });
    });

    test('handles unenrollment errors', async () => {
      mockConfirm.mockReturnValue(true);
      mockApi.enrollmentAPI.delete.mockRejectedValue(new Error('Server error'));

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Unenroll')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Unenroll'));

      await waitFor(() => {
        expect(screen.getByText('Failed to unenroll from course. Please try again.')).toBeInTheDocument();
      });
    });

    test('handles permission errors', async () => {
      mockConfirm.mockReturnValue(true);
      const error = { response: { status: 403 } };
      mockApi.enrollmentAPI.delete.mockRejectedValue(error);

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Unenroll')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Unenroll'));

      await waitFor(() => {
        expect(screen.getByText('You do not have permission to unenroll from this course')).toBeInTheDocument();
      });
    });

    test('disables unenroll button during operation', async () => {
      mockConfirm.mockReturnValue(true);
      mockApi.enrollmentAPI.delete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Unenroll')).toBeInTheDocument();
      });

      const unenrollButton = screen.getByText('Unenroll');
      fireEvent.click(unenrollButton);

      await waitFor(() => {
        expect(screen.getByText('Unenrolling...')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    test('displays enrollment details correctly', async () => {
      const multipleEnrollments = [
        mockEnrollment,
        {
          ...mockEnrollment,
          id: 2,
          day: 'wednesday',
          startTime: '14:00',
          endTime: '16:00',
          room: 'B105'
        }
      ];

      mockApi.enrollmentAPI.getByStudent.mockResolvedValue({ data: multipleEnrollments });

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('2 courses enrolled')).toBeInTheDocument();
        expect(screen.getAllByText('Advanced Mathematics')).toHaveLength(2);
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
        expect(screen.getByText('08:00-10:00')).toBeInTheDocument();
        expect(screen.getByText('14:00-16:00')).toBeInTheDocument();
        expect(screen.getByText('A203')).toBeInTheDocument();
        expect(screen.getByText('B105')).toBeInTheDocument();
      });
    });

    test('handles missing course information gracefully', async () => {
      const enrollmentWithMissingInfo = {
        ...mockEnrollment,
        classTitle: undefined,
        teacherName: undefined,
        day: undefined,
        startTime: undefined,
        endTime: undefined,
        room: undefined
      };

      mockApi.enrollmentAPI.getByStudent.mockResolvedValue({ data: [enrollmentWithMissingInfo] });

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument(); // fallback to course data
        expect(screen.getByText('John Smith')).toBeInTheDocument(); // fallback to teacher data
        expect(screen.getByText('N/A')).toBeInTheDocument(); // for missing data
        expect(screen.getByText('Time not specified')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('provides link to available courses when no enrollments', async () => {
      mockApi.enrollmentAPI.getByStudent.mockResolvedValue({ data: [] });

      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Browse Available Courses' });
        expect(link).toHaveAttribute('href', '/available-courses');
      });
    });
  });

  describe('Error Handling', () => {
    test('clears errors when starting new operations', async () => {
      // First, cause an error
      mockApi.studentAPI.getAll.mockRejectedValueOnce(new Error('Initial error'));
      
      renderWithRouter(<MyEnrollments />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load your enrollments. Please try again.')).toBeInTheDocument();
      });

      // Then refresh successfully
      mockApi.studentAPI.getAll.mockResolvedValue({ data: [mockStudent] });
      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(screen.queryByText('Failed to load your enrollments. Please try again.')).not.toBeInTheDocument();
      });
    });
  });
});