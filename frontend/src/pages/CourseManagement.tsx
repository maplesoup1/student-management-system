import React, { useState, useEffect } from 'react';
import { classAPI, teacherAPI } from '../api';
import { Class, Teacher } from '../types';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        classAPI.getAll(),
        teacherAPI.getAll()
      ]);
      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (classId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await classAPI.delete(classId);
      alert('Class deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  if (loading) {
    return <div className="loading-message">Loading courses...</div>;
  }

  return (
    <div className="card">
      <div className="header">
        <h2>Class Management</h2>
        <button className="btn btn-primary btn-sm" onClick={fetchData}>
          Refresh
        </button>
      </div>

      <div className="responsive-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Teacher</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td><strong>{course.title}</strong></td>
                <td>{getTeacherName(course.teacherId)}</td>
                <td>
                  <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                    <code>{JSON.stringify(course.schedule)}</code>
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          No courses found
        </div>
      )}
    </div>
  );
};

export default CourseManagement;