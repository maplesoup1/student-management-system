import React, { useState } from 'react';
import axios from 'axios';

const ClassForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [schedule, setSchedule] = useState('{"days": ["Mon","Wed"], "time": "14:00-15:30", "room": "A203"}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate JSON format
      JSON.parse(schedule);
      
      const classData = {
        title,
        teacherId: parseInt(teacherId),
        schedule
      };

      await axios.post('http://localhost:8080/api/classes', classData);
      alert('Class created successfully!');
      setTitle('');
      setTeacherId('');
      setSchedule('{"days": ["Mon","Wed"], "time": "14:00-15:30", "room": "A203"}');
    } catch (error) {
      alert('Error creating class. Please check your JSON format.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Create New Class</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Class Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="teacherId">Teacher ID:</label>
          <input
            type="number"
            id="teacherId"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="schedule">Schedule (JSON):</label>
          <textarea
            id="schedule"
            rows={4}
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder='{"days": ["Mon","Wed"], "time": "14:00-15:30", "room": "A203"}'
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Class</button>
      </form>
    </div>
  );
};

export default ClassForm;