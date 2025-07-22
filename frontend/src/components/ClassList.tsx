import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Class {
  id: number;
  title: string;
  schedule: string;
  teacherId: number;
}

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/classes');
      setClasses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
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

  if (loading) {
    return <div>Loading classes...</div>;
  }

  return (
    <div>
      <h2>All Classes</h2>
      {classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Teacher ID</th>
              <th>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem.id}>
                <td>{classItem.id}</td>
                <td>{classItem.title}</td>
                <td>{classItem.teacherId}</td>
                <td>{formatSchedule(classItem.schedule)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClassList;