import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, studentAPI, classAPI, teacherAPI } from '../api';
import { Enrollment, Student, Class, Teacher } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import MessageDisplay from '../components/MessageDisplay';
import { formatScheduleForTable } from '../utils/scheduleUtils';

const MyEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState<number | null>(null);
  const { error, successMessage, handleError, clearError, clearSuccess, showSuccess } = useErrorHandler();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const [studentsRes, coursesRes, teachersRes] = await Promise.all([
        studentAPI.getAll(),
        classAPI.getAll(),
        teacherAPI.getAll()
      ]);

      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);

      const student = studentsRes.data.find(s => s.userId === currentUser.id);
      if (student) {
        setCurrentStudent(student);
        
        const enrollmentsRes = await enrollmentAPI.getByStudent(student.id);
        setEnrollments(enrollmentsRes.data);
      }
    } catch (error: any) {
      handleError(error, 'Failed to load your enrollments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId: number, classTitle: string) => {
    if (!window.confirm(`Are you sure you want to unenroll from "${classTitle}"?`)) {
      return;
    }

    setUnenrollingId(enrollmentId);
    clearError();
    try {
      await enrollmentAPI.delete(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      showSuccess('Successfully unenrolled from course');
    } catch (error: any) {
      if (error.response?.status === 403) {
        handleError(error, 'You do not have permission to unenroll from this course');
      } else {
        handleError(error, 'Failed to unenroll from course. Please try again.');
      }
    } finally {
      setUnenrollingId(null);
    }
  };

  const getCourseInfo = (classId: number) => {
    return courses.find(c => c.id === classId);
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };


  if (loading) {
    return <div className="loading-message">Loading your enrollments...</div>;
  }

  if (!currentStudent) {
    return (
      <div className="card">
        <p>Student information not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <MessageDisplay 
        error={error} 
        success={successMessage} 
        onClearError={clearError} 
        onClearSuccess={clearSuccess} 
      />
      
      <div className="header">
        <h2>My Enrolled Courses</h2>
        <div>
          <span style={{ marginRight: '1rem', color: '#6c757d' }}>
            {enrollments.length} courses enrolled
          </span>
          <button className="btn btn-primary btn-sm" onClick={fetchEnrollments}>
            Refresh
          </button>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>You are not enrolled in any courses yet.</p>
          <p>
            <Link to="/available-courses" className="btn btn-primary">
              Browse Available Courses
            </Link>
          </p>
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Class Title</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(enrollment => {
                const course = getCourseInfo(enrollment.classId);
                return (
                  <tr key={enrollment.id}>
                    <td>
                      <strong>{enrollment.classTitle || course?.title}</strong>
                      {course?.subject && (
                        <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                          {course.subject}
                        </div>
                      )}
                    </td>
                    <td>
                      {enrollment.teacherName || (course ? getTeacherName(course.teacherId) : 'Unknown Teacher')}
                    </td>
                    <td>
                      {course ? formatScheduleForTable(course.schedule) : <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Schedule not available</span>}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnenroll(enrollment.id, enrollment.classTitle || course?.title || 'Class')}
                        disabled={unenrollingId === enrollment.id}
                      >
                        {unenrollingId === enrollment.id ? 'Unenrolling...' : 'Unenroll'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;