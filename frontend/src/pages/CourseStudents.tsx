import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { classAPI, enrollmentAPI } from '../api';
import { Class, Enrollment } from '../types';
import { formatScheduleForTable } from '../utils/scheduleUtils';

const CourseStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classItem, setClassItem] = useState<Class | null>(null);
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseStudents(parseInt(id));
    }
  }, [id]);

  const fetchCourseStudents = async (classId: number) => {
    setLoading(true);
    try {
      const [classResponse, enrollmentsResponse] = await Promise.all([
        classAPI.getById(classId),
        enrollmentAPI.getByClass(classId)
      ]);

      setClassItem(classResponse.data);
      setStudents(enrollmentsResponse.data);
    } catch (error) {
      console.error('Error fetching course students:', error);
      alert('Error fetching course information');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="loading-message">Loading course information...</div>;
  }

  if (!classItem) {
    return (
      <div className="card">
        <p>Class not found</p>
        <Link to="/my-courses" className="btn btn-primary">
          Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="header">
        <div>
          <h2>{classItem.title}</h2>
          <p style={{ color: '#6c757d', margin: '0.5rem 0' }}>
            {formatScheduleForTable(classItem.schedule)}
          </p>
        </div>
        <Link to="/my-courses" className="btn btn-secondary">
          Back to My Courses
        </Link>
      </div>

      <div className="course-info" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Class Information</h3>
        <p><strong>Title:</strong> {classItem.title}</p>
        {classItem.subject && <p><strong>Subject:</strong> {classItem.subject}</p>}
        <div><strong>Schedule:</strong></div>
        <div style={{ marginTop: '0.5rem' }}>{formatScheduleForTable(classItem.schedule)}</div>
        <p><strong>Total Enrolled Students:</strong> {students.length}</p>
      </div>

      <h3>Enrolled Students</h3>
      
      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          No students enrolled in this course yet.
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map(enrollment => (
                <tr key={enrollment.id}>
                  <td><strong>{enrollment.studentName}</strong></td>
                  <td>{enrollment.studentEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseStudents;