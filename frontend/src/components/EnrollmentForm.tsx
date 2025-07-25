import React, { useState } from 'react';
import { enrollmentAPI } from '../api';

const EnrollmentForm: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const enrollmentData = {
        studentId: parseInt(studentId),
        classId: parseInt(classId)
      };

      await enrollmentAPI.create(enrollmentData);
      alert('Student enrolled successfully!');
      setStudentId('');
      setClassId('');
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error enrolling student');
      }
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Enroll Student in Class</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="studentId">Student ID:</label>
          <input
            type="number"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="classId">Class ID:</label>
          <input
            type="number"
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Enroll Student</button>
      </form>
    </div>
  );
};

export default EnrollmentForm;