import React, { useState } from 'react';
import { classAPI } from '../api';
import { useTeachers } from '../hooks';
import { Schedule } from '../types';

const ClassForm: React.FC = () => {
  const { teachers, loading: teachersLoading } = useTeachers();
  const [formData, setFormData] = useState({
    title: '',
    teacherId: '',
    subject: ''
  });
  const [schedule, setSchedule] = useState<Schedule>({
    days: ['Mon', 'Wed'],
    time: '14:00-15:30',
    room: 'A203'
  });
  const [loading, setLoading] = useState(false);

  const handleScheduleChange = (field: keyof Schedule, value: any) => {
    setSchedule(prev => ({ ...prev, [field]: value }));
  };

  const handleDaysChange = (day: string, checked: boolean) => {
    setSchedule(prev => ({
      ...prev,
      days: checked 
        ? [...prev.days, day].filter((d, i, arr) => arr.indexOf(d) === i)
        : prev.days.filter(d => d !== day)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.teacherId) return;

    setLoading(true);
    try {
      await classAPI.create({
        title: formData.title,
        teacherId: parseInt(formData.teacherId),
        subject: formData.subject,
        schedule: JSON.stringify(schedule)
      });
      
      // Reset form
      setFormData({ title: '', teacherId: '', subject: '' });
      setSchedule({ days: ['Mon', 'Wed'], time: '14:00-15:30', room: 'A203' });
      alert('Class created successfully!');
    } catch (error) {
      alert('Error creating class');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="card">
      <h2>📚 Create New Class</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Class Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Advanced Mathematics"
            required
          />
        </div>

        <div className="form-group">
          <label>Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="e.g., Mathematics"
          />
        </div>

        <div className="form-group">
          <label>Teacher *</label>
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
            required
          >
            <option value="">Select a teacher</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.subject})
              </option>
            ))}
          </select>
        </div>

        <div className="schedule-section">
          <h3>📅 Schedule</h3>
          
          <div className="form-group">
            <label>Days</label>
            <div className="days-selector">
              {dayOptions.map(day => (
                <label key={day} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={schedule.days.includes(day)}
                    onChange={(e) => handleDaysChange(day, e.target.checked)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time</label>
              <input
                type="text"
                value={schedule.time}
                onChange={(e) => handleScheduleChange('time', e.target.value)}
                placeholder="14:00-15:30"
              />
            </div>
            
            <div className="form-group">
              <label>Room</label>
              <input
                type="text"
                value={schedule.room}
                onChange={(e) => handleScheduleChange('room', e.target.value)}
                placeholder="A203"
              />
            </div>
          </div>
        </div>

        <div className="schedule-preview">
          <strong>Preview:</strong> {schedule.days.join(', ')} at {schedule.time} in {schedule.room}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || teachersLoading}
        >
          {loading ? '⏳ Creating...' : '✅ Create Class'}
        </button>
      </form>
    </div>
  );
};

export default ClassForm;