import React, { useState } from 'react';
import { enrollmentAPI } from '../api';
import { useStudents, useClasses, useEnrollments } from '../hooks';

const EnrollmentManagement: React.FC = () => {
  const { students, loading: studentsLoading } = useStudents();
  const { classes, loading: classesLoading } = useClasses();
  const { enrollments, loading: enrollmentsLoading, refetch } = useEnrollments();
  
  const [formData, setFormData] = useState({
    studentId: '',
    classId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.classId) return;

    setLoading(true);
    try {
      await enrollmentAPI.create({
        studentId: parseInt(formData.studentId),
        classId: parseInt(formData.classId)
      });
      
      setFormData({ studentId: '', classId: '' });
      refetch();
      alert('✅ Student enrolled successfully!');
    } catch (error: any) {
      alert(error.response?.data || 'Error enrolling student');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;
    
    try {
      await enrollmentAPI.delete(enrollmentId);
      refetch();
      alert('✅ Enrollment removed successfully!');
    } catch (error) {
      alert('Error removing enrollment');
    }
  };

  const isLoading = studentsLoading || classesLoading || enrollmentsLoading;

  if (isLoading) return <div className="loading">👥 Loading enrollment data...</div>;

  return (
    <div className="card">
      <h2>👥 Enrollment Management</h2>
      
      {/* Enrollment Form */}
      <div className="enrollment-form">
        <h3>➕ New Enrollment</h3>
        <form onSubmit={handleEnroll} className="form-inline">
          <div className="form-group">
            <label>Student</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              required
            >
              <option value="">Select student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Class</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({...formData, classId: e.target.value})}
              required
            >
              <option value="">Select class</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.title} - {classItem.teacherName}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? '⏳' : '➕'} Enroll
          </button>
        </form>
      </div>

      {/* Enrollments List */}
      <div className="enrollments-section">
        <div className="header">
          <h3>📋 Current Enrollments</h3>
          <span className="badge">{enrollments.length} enrollments</span>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state">
            <p>📝 No enrollments found.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Teacher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div>
                        <strong>{enrollment.studentName}</strong>
                        <small>{enrollment.studentEmail}</small>
                      </div>
                    </td>
                    <td>
                      <span className="class-badge">
                        {enrollment.classTitle}
                      </span>
                    </td>
                    <td>
                      {enrollment.teacherName}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleUnenroll(enrollment.id)}
                        className="btn btn-danger btn-sm"
                        title="Remove enrollment"
                      >
                        ❌ Unenroll
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentManagement;