import React from 'react';
import { useClasses } from '../hooks';
import { Schedule } from '../types';

const ClassList: React.FC = () => {
  const { classes, loading } = useClasses();

  const formatSchedule = (scheduleStr: string) => {
    try {
      const schedule: Schedule = JSON.parse(scheduleStr);
      return `${schedule.days.join(', ')} at ${schedule.time} in ${schedule.room}`;
    } catch {
      return scheduleStr;
    }
  };

  if (loading) return <div className="loading">📚 Loading classes...</div>;

  return (
    <div className="card">
      <div className="header">
        <h2>📚 All Classes</h2>
        <span className="badge">{classes.length} classes</span>
      </div>
      
      {classes.length === 0 ? (
        <div className="empty-state">
          <p>📝 No classes found. <a href="/create-class">Create your first class</a></p>
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>
                    <strong>{classItem.title}</strong>
                    <small>#{classItem.id}</small>
                  </td>
                  <td>
                    {classItem.teacherName || `Teacher #${classItem.teacherId}`}
                  </td>
                  <td>
                    <span className="schedule-badge">
                      {formatSchedule(classItem.schedule)}
                    </span>
                  </td>
                  <td>
                    <span className="subject-tag">{classItem.subject || 'N/A'}</span>
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

export default ClassList;