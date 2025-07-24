
import React, { useState, useEffect } from 'react';
import { useClasses, useEnrollments } from '../hooks';
import { enrollmentAPI, studentAPI } from '../api';
import { Student } from '../types';
import { formatScheduleForTable } from '../utils/scheduleUtils';

const StudentDashboard: React.FC = () => {
  const { classes, loading: classesLoading } = useClasses();
  const { enrollments, loading: enrollmentsLoading, refetch: refetchEnrollments } = useEnrollments();
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch the actual student record for the current user
  useEffect(() => {
    const fetchCurrentStudent = async () => {
      try {
        const { data: students } = await studentAPI.getAll();
        const currentStudent = students.find((s: Student) => s.userId === currentUser.id);
        if (currentStudent) {
          setStudentId(currentStudent.id);
        }
      } catch (error) {
        console.error('Error fetching current student:', error);
      } finally {
        setLoadingStudent(false);
      }
    };

    if (currentUser.id) {
      fetchCurrentStudent();
    }
  }, [currentUser.id]);


  const handleEnroll = async (classId: number) => {
    if (!studentId) {
      alert('Please log in as a student to enroll.');
      return;
    }
    setLoadingEnroll(true);
    try {
      await enrollmentAPI.create({ studentId, classId });
      alert('Enrolled successfully!');
      refetchEnrollments();
    } catch (error: any) {
      alert(error.message || 'Error enrolling in course.');
    } finally {
      setLoadingEnroll(false);
    }
  };

  const isEnrolled = (classId: number) => {
    return enrollments.some(enrollment => enrollment.classId === classId && enrollment.studentId === studentId);
  };

  if (classesLoading || enrollmentsLoading || loadingStudent) return <div className="loading-message">Loading student dashboard...</div>;

  if (!studentId) {
    return <div className="card"><p>Error: Could not find student record for current user.</p></div>;
  }

  const myEnrollments = enrollments.filter(enrollment => enrollment.studentId === studentId);
  const availableClasses = classes.filter(classItem => !isEnrolled(classItem.id));

  return (
    <div className="card">
      <h2>Hello, {currentUser.username}!</h2>

      <div className="header">
        <h3>📋 My Enrolled Courses</h3>
        <span className="badge">{myEnrollments.length} enrolled</span>
      </div>
      {myEnrollments.length === 0 ? (
        <div className="empty-state">
          <p>You are not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Class Title</th>
                <th>Teacher</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {myEnrollments.map(enrollment => (
                <tr key={enrollment.id}>
                  <td>{enrollment.classTitle}</td>
                  <td>{enrollment.teacherName}</td>
                  <td>{enrollment.classTitle && classes.find(c => c.id === enrollment.classId)?.schedule ? formatScheduleForTable(classes.find(c => c.id === enrollment.classId)!.schedule) : <span style={{ color: '#6c757d', fontStyle: 'italic' }}>N/A</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="header" style={{ marginTop: '30px' }}>
        <h3>📚 Available Classes</h3>
        <span className="badge">{availableClasses.length} available</span>
      </div>
      {availableClasses.length === 0 ? (
        <div className="empty-state">
          <p>No new classes available for enrollment.</p>
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
              {availableClasses.map(classItem => (
                <tr key={classItem.id}>
                  <td>{classItem.title}</td>
                  <td>{classItem.teacherName}</td>
                  <td>{formatScheduleForTable(classItem.schedule)}</td>
                  <td>
                    <button 
                      onClick={() => handleEnroll(classItem.id)}
                      className="btn btn-primary btn-sm"
                      disabled={loadingEnroll}
                    >
                      {loadingEnroll ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
