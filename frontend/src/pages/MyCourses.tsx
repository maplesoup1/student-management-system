import React, { useState, useEffect } from 'react';
import { classAPI, teacherAPI, enrollmentAPI } from '../api';
import { Class, Teacher, Enrollment } from '../types';
import { formatScheduleForTable } from '../utils/scheduleUtils';
import { Link } from 'react-router-dom';

const MyCourses: React.FC = () => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<{[classId: number]: Enrollment[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username) {
        const teachersResponse = await teacherAPI.getAll();
        const teacher = teachersResponse.data.find(t => t.username === user.username);
        
        if (teacher) {
          setCurrentTeacher(teacher);
          
          const classesResponse = await classAPI.getByTeacher(teacher.id);
          const teacherClasses = classesResponse.data;
          setClasses(teacherClasses);

          const enrollmentPromises = teacherClasses.map(async (classItem) => {
            const enrollmentResponse = await enrollmentAPI.getByClass(classItem.id);
            return { classId: classItem.id, enrollments: enrollmentResponse.data };
          });
          
          const enrollmentResults = await Promise.all(enrollmentPromises);
          const enrollmentMap = enrollmentResults.reduce((acc, { classId, enrollments }) => {
            acc[classId] = enrollments;
            return acc;
          }, {} as {[classId: number]: Enrollment[]});
          
          setEnrollments(enrollmentMap);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      alert('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCourse = async (classId: number) => {
    if (!window.confirm('Are you sure you want to cancel this course? This action cannot be undone.')) {
      return;
    }

    try {
      await classAPI.delete(classId);
      alert('Course cancelled successfully');
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error cancelling course:', error);
      alert('Error cancelling course');
    }
  };


  if (loading) {
    return <div className="loading-message">Loading your courses...</div>;
  }

  if (!currentTeacher) {
    return <div className="card">Teacher information not found</div>;
  }

  return (
    <div className="card">
      <div className="header">
        <h2>My Courses</h2>
        <div>
          <span style={{ marginRight: '1rem', color: '#6c757d' }}>
            {currentTeacher.name} - {currentTeacher.subject}
          </span>
          <button className="btn btn-primary btn-sm" onClick={fetchTeacherCourses}>
            Refresh
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>You haven't created any courses yet.</p>
          <Link to="/create-course" className="btn btn-primary">
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Schedule</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(classItem => {
                const classEnrollments = enrollments[classItem.id] || [];
                return (
                  <tr key={classItem.id}>
                    <td>
                      <strong>{classItem.title}</strong>
                      {classItem.subject && <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                        {classItem.subject}
                      </div>}
                    </td>
                    <td>{formatScheduleForTable(classItem.schedule)}</td>
                    <td>
                      <Link 
                        to={`/course-students/${classItem.id}`}
                        className="student-count-link"
                      >
                        {classEnrollments.length} students
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/edit-course/${classItem.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelCourse(classItem.id)}
                        >
                          Cancel Course
                        </button>
                      </div>
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

export default MyCourses;