import React, { useState } from 'react';
import axios from 'axios';

interface Class {
  id: number;
  title: string;
  schedule: string;
  teacherId: number;
}

const TeacherDashboard: React.FC = () => {
  const [teacherId, setTeacherId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeacherClasses = async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/teachers/${teacherId}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      alert('Error fetching classes for this teacher');
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (scheduleStr: string) => {
    try {
      const schedule = JSON.parse(scheduleStr);
      return `${schedule.days.join(', ')} at ${schedule.time} in ${schedule.room}`;
    } catch (error) {
      return scheduleStr;
    }
  };

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <div className="form-group">
        <label htmlFor="teacherId">Enter Teacher ID:</label>
        <input
          type="number"
          id="teacherId"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          placeholder="Enter teacher ID"
        />
        <button 
          onClick={fetchTeacherClasses} 
          className="btn btn-primary"
          style={{ marginLeft: '10px' }}
        >
          View My Classes
        </button>
      </div>

      {loading && <p>Loading classes...</p>}

      {classes.length > 0 && (
        <div>
          <h3>Your Classes</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.id}</td>
                  <td>{classItem.title}</td>
                  <td>{formatSchedule(classItem.schedule)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && teacherId && classes.length === 0 && (
        <p>No classes found for this teacher.</p>
      )}
    </div>
  );
};

export default TeacherDashboard;