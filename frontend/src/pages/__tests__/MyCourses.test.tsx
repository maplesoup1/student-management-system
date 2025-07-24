import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MyCourses from '../MyCourses';
import * as api from '../../api';
import { Class, Teacher, Enrollment } from '../../types';

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

// Mock window.confirm and alert
Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
});

Object.defineProperty(window, 'alert', {
  value: jest.fn(),
});

const mockConfirm = window.confirm as jest.MockedFunction<typeof window.confirm>;
const mockAlert = window.alert as jest.MockedFunction<typeof window.alert>;

// Test data
const mockUser = { id: 2, username: 'john_smith', role: 'TEACHER' };

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
    friday: [{ start: '14:00', end: '16:00', room: 'B105' }],
    saturday: [],
    sunday: []
  }
};

const mockEnrollments: Enrollment[] = [
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
  },
  {
    id: 2,
    studentId: 2,
    classId: 1,
    studentName: 'Bob Davis',
    studentEmail: 'bob.davis@example.com',
    classTitle: 'Advanced Mathematics',
    teacherName: 'John Smith',
    day: 'friday',
    startTime: '14:00',
    endTime: '16:00',
    room: 'B105'
  }
];

// Wrapper component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MyCourses Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    // Default API mocks
    mockApi.teacherAPI.getAll.mockResolvedValue({ data: [mockTeacher] });
    mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [mockClass] });
    mockApi.enrollmentAPI.getByClass.mockResolvedValue({ data: mockEnrollments });
    mockApi.classAPI.delete.mockResolvedValue({});
    mockApi.classAPI.update.mockResolvedValue({});
    mockApi.enrollmentAPI.delete.mockResolvedValue({});
  });

  describe('Rendering', () => {
    test('renders loading state initially', () => {
      renderWithRouter(<MyCourses />);
      expect(screen.getByText('Loading your courses...')).toBeInTheDocument();
    });

    test('renders course data correctly with time slots', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('My Courses')).toBeInTheDocument();
        expect(screen.getByText('John Smith - Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument();
        
        // Should show individual time slots
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
        expect(screen.getByText('Friday')).toBeInTheDocument();
        expect(screen.getByText('08:00-10:00')).toBeInTheDocument();
        expect(screen.getByText('14:00-16:00')).toBeInTheDocument();
        expect(screen.getByText('A203')).toBeInTheDocument();
        expect(screen.getByText('B105')).toBeInTheDocument();
      });
    });

    test('renders empty state when no courses', async () => {
      mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText("You haven't created any courses yet.")).toBeInTheDocument();
        expect(screen.getByText('Create Your First Course')).toBeInTheDocument();
      });
    });

    test('renders error state when teacher not found', async () => {
      mockApi.teacherAPI.getAll.mockResolvedValue({ data: [] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Teacher information not found')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    test('calls correct APIs on component mount', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(mockApi.teacherAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockApi.classAPI.getByTeacher).toHaveBeenCalledWith(1);
        expect(mockApi.enrollmentAPI.getByClass).toHaveBeenCalledWith(1);
      });
    });

    test('handles API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.teacherAPI.getAll.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error fetching courses');
      });

      consoleError.mockRestore();
    });

    test('refreshes data when refresh button is clicked', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(mockApi.teacherAPI.getAll).toHaveBeenCalledTimes(2);
        expect(mockApi.classAPI.getByTeacher).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Course Management', () => {
    test('shows confirmation dialog before canceling entire course', async () => {
      mockConfirm.mockReturnValue(false);

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Course')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel Course'));

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to cancel this entire course? This action cannot be undone.'
      );
      expect(mockApi.classAPI.delete).not.toHaveBeenCalled();
    });

    test('cancels course successfully when confirmed', async () => {
      mockConfirm.mockReturnValue(true);

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Course')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel Course'));

      await waitFor(() => {
        expect(mockApi.classAPI.delete).toHaveBeenCalledWith(1);
        expect(mockAlert).toHaveBeenCalledWith('Course cancelled successfully');
      });
    });

    test('handles course cancellation errors', async () => {
      mockConfirm.mockReturnValue(true);
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.classAPI.delete.mockRejectedValue(new Error('Server error'));

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Course')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel Course'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error cancelling course');
      });

      consoleError.mockRestore();
    });
  });

  describe('Time Slot Management', () => {
    test('shows confirmation dialog before canceling time slot', async () => {
      mockConfirm.mockReturnValue(false);

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getAllByText('Cancel Time Slot')).toHaveLength(3); // 3 time slots
      });

      fireEvent.click(screen.getAllByText('Cancel Time Slot')[0]);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to cancel the time slot: monday 08:00-10:00? All student enrollments for this time slot will be removed.'
      );
      expect(mockApi.classAPI.update).not.toHaveBeenCalled();
    });

    test('cancels time slot successfully when confirmed', async () => {
      mockConfirm.mockReturnValue(true);

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getAllByText('Cancel Time Slot')).toHaveLength(3);
      });

      // Click on monday time slot cancel button
      fireEvent.click(screen.getAllByText('Cancel Time Slot')[0]);

      await waitFor(() => {
        // Should update class schedule
        expect(mockApi.classAPI.update).toHaveBeenCalledWith(1, expect.objectContaining({
          schedule: expect.objectContaining({
            monday: [], // Should be empty after removal
            wednesday: [{ start: '08:00', end: '10:00', room: 'A203' }], // Should remain
            friday: [{ start: '14:00', end: '16:00', room: 'B105' }] // Should remain
          })
        }));

        // Should delete related enrollments
        expect(mockApi.enrollmentAPI.delete).toHaveBeenCalledWith(1);
        
        expect(mockAlert).toHaveBeenCalledWith('Time slot monday 08:00-10:00 has been cancelled successfully');
      });
    });

    test('handles time slot cancellation errors', async () => {
      mockConfirm.mockReturnValue(true);
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.classAPI.update.mockRejectedValue(new Error('Server error'));

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getAllByText('Cancel Time Slot')).toHaveLength(3);
      });

      fireEvent.click(screen.getAllByText('Cancel Time Slot')[0]);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error cancelling time slot');
      });

      consoleError.mockRestore();
    });

    test('handles class not found error during time slot cancellation', async () => {
      mockConfirm.mockReturnValue(true);
      // Simulate class not found by returning empty array
      mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText("You haven't created any courses yet.")).toBeInTheDocument();
      });
    });
  });

  describe('Enrollment Display', () => {
    test('displays correct student count for each time slot', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        const studentLinks = screen.getAllByText(/students/);
        expect(studentLinks).toHaveLength(3); // One for each time slot
        
        // Each time slot should show its enrollment count
        expect(screen.getByText('1 students')).toBeInTheDocument(); // monday slot
        expect(screen.getAllByText('1 students')).toHaveLength(2); // friday slot has 1 student too
        expect(screen.getByText('0 students')).toBeInTheDocument(); // wednesday slot has no enrollments
      });
    });

    test('provides links to course students page', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        const studentLinks = screen.getAllByRole('link', { name: /students/ });
        studentLinks.forEach(link => {
          expect(link).toHaveAttribute('href', '/course-students/1');
        });
      });
    });
  });

  describe('Navigation', () => {
    test('provides edit course links', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        const editLink = screen.getByRole('link', { name: 'Edit' });
        expect(editLink).toHaveAttribute('href', '/edit-course/1');
      });
    });

    test('provides create course link when no courses', async () => {
      mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        const createLink = screen.getByRole('link', { name: 'Create Your First Course' });
        expect(createLink).toHaveAttribute('href', '/create-course');
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles course with no schedule', async () => {
      const courseWithoutSchedule = {
        ...mockClass,
        schedule: {}
      };
      mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [courseWithoutSchedule] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument();
        expect(screen.getByText('No schedule configured')).toBeInTheDocument();
      });
    });

    test('handles course with empty time slots', async () => {
      const courseWithEmptySlots = {
        ...mockClass,
        schedule: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        }
      };
      mockApi.classAPI.getByTeacher.mockResolvedValue({ data: [courseWithEmptySlots] });

      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument();
        expect(screen.getByText('No schedule configured')).toBeInTheDocument();
      });
    });

    test('displays course title only once for multiple time slots', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        // Course title should appear only once (in the first row of each course)
        const courseTitles = screen.getAllByText('Advanced Mathematics');
        expect(courseTitles).toHaveLength(1);
      });
    });

    test('displays edit and cancel course buttons only once per course', async () => {
      renderWithRouter(<MyCourses />);

      await waitFor(() => {
        expect(screen.getAllByText('Edit')).toHaveLength(1);
        expect(screen.getAllByText('Cancel Course')).toHaveLength(1);
        expect(screen.getAllByText('Cancel Time Slot')).toHaveLength(3); // One per time slot
      });
    });
  });
});