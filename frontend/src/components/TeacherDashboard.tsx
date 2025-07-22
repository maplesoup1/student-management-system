import React, { useState } from 'react';
import { classAPI, enrollmentAPI } from '../api';
import { useTeachers } from '../hooks';
import { Class, Enrollment, Schedule } from '../types';

const TeacherDashboard: React.FC = () => {
  const { teachers, loading: teachersLoading } = useTeachers();
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<{[classId: number]: Enrollment[]}>({});
  const [loading, setLoading] = useState(false);

  const selectedTeacher = teachers.find(t => t.id === parseInt(selectedTeacherId));

  const fetchTeacherData = async () => {
    if (!selectedTeacherId) return;
    
    setLoading(true);
    try {
      // Fetch teacher's classes
      const classesResponse = await classAPI.getByTeacher(parseInt(selectedTeacherId));
      const teacherClasses = classesResponse.data;
      setClasses(teacherClasses);

      // Fetch enrollments for each class
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
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      alert('Error fetching teacher data');
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (scheduleStr: string) => {
    try {
      const schedule: Schedule = JSON.parse(scheduleStr);
      return `${schedule.days.join(', ')} at ${schedule.time} in ${schedule.room}`;
    } catch {
      return scheduleStr;
    }
  };

  const getTotalStudents = () => {
    return Object.values(enrollments).flat().length;
  };

  if (teachersLoading) return <div className="loading">👨‍🏫 Loading teachers...</div>;

  return (
    <div className="card">
      <h2>👨‍🏫 Teacher Dashboard</h2>
      
      {/* Teacher Selection */}
      <div className="teacher-selector">
        <div className="form-group">
          <label>Select Teacher</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">Choose a teacher</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.subject}
              </option>
            ))}
          </select>
          
          <button 
            onClick={fetchTeacherData} 
            className="btn btn-primary"
            disabled={!selectedTeacherId || loading}
          >
            {loading ? '⏳ Loading...' : '📊 Load Dashboard'}
          </button>
        </div>
      </div>

      {/* Teacher Overview */}
      {selectedTeacher && classes.length > 0 && (
        <div className="teacher-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{selectedTeacher.name}</h3>
              <p>{selectedTeacher.subject}</p>
            </div>
            <div className="stat-card">
              <h3>{classes.length}</h3>
              <p>Classes Teaching</p>
            </div>
            <div className="stat-card">
              <h3>{getTotalStudents()}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>
      )}

      {/* Classes List */}
      {classes.length > 0 && (
        <div className="classes-section">
          <h3>📚 Your Classes</h3>
          <div className="classes-grid">
            {classes.map((classItem) => {
              const classEnrollments = enrollments[classItem.id] || [];
              return (
                <div key={classItem.id} className="class-card">
                  <div className="class-header">
                    <h4>{classItem.title}</h4>
                    <span className="student-count">
                      👥 {classEnrollments.length} students
                    </span>
                  </div>
                  
                  <div className="class-info">
                    <p><strong>Schedule:</strong> {formatSchedule(classItem.schedule)}</p>
                    {classItem.subject && <p><strong>Subject:</strong> {classItem.subject}</p>}
                  </div>

                  {classEnrollments.length > 0 && (
                    <div className="students-list">
                      <h5>Enrolled Students:</h5>
                      <ul>
                        {classEnrollments.map((enrollment) => (
                          <li key={enrollment.id}>
                            <strong>{enrollment.studentName}</strong>
                            <small>{enrollment.studentEmail}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && selectedTeacherId && classes.length === 0 && (
        <div className="empty-state">
          <p>📝 No classes found for this teacher.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;