import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, teacherAPI, conflictAPI } from '../api';
import { Schedule, Teacher, TimeSlot } from '../types';

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: ''
  });
  const [schedule, setSchedule] = useState<Schedule>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [timeSlots, setTimeSlots] = useState<{[key: string]: TimeSlot[]}>({});
  const [conflicts, setConflicts] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchCurrentTeacher();
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCurrentTeacher = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username) {
        const response = await teacherAPI.getAll();
        const teacher = response.data.find(t => t.username === user.username);
        if (teacher) {
          setCurrentTeacher(teacher);
          setFormData(prev => ({ ...prev, subject: teacher.subject }));
        }
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await classAPI.getById(Number(id));
      const course = response.data;
      
      setFormData({
        title: course.title,
        subject: course.subject || ''
      });

      // Parse existing schedule
      try {
        const existingSchedule: Schedule = JSON.parse(course.schedule);
        setSchedule(existingSchedule);
        
        // Convert Schedule to timeSlots format
        const timeSlotsData: {[key: string]: TimeSlot[]} = {
          monday: existingSchedule.monday,
          tuesday: existingSchedule.tuesday,
          wednesday: existingSchedule.wednesday,
          thursday: existingSchedule.thursday,
          friday: existingSchedule.friday,
          saturday: existingSchedule.saturday,
          sunday: existingSchedule.sunday
        };
        setTimeSlots(timeSlotsData);
      } catch {
        // If schedule parsing fails, keep empty schedule
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Error loading course data');
    }
  };

  const updateSchedule = () => {
    const newSchedule: Schedule = {
      monday: timeSlots.monday || [],
      tuesday: timeSlots.tuesday || [],
      wednesday: timeSlots.wednesday || [],
      thursday: timeSlots.thursday || [],
      friday: timeSlots.friday || [],
      saturday: timeSlots.saturday || [],
      sunday: timeSlots.sunday || []
    };
    setSchedule(newSchedule);
  };

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = { start: '09:00', end: '10:30', room: 'A203' };
    setTimeSlots(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), newSlot]
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTimeSlot = (day: string, index: number, field: keyof TimeSlot, value: string) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day]?.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      ) || []
    }));
  };

  const checkConflicts = async (day: string, slotIndex: number) => {
    if (!currentTeacher || !timeSlots[day] || !timeSlots[day][slotIndex]) return;

    const slot = timeSlots[day][slotIndex];
    if (!slot.start || !slot.end || !slot.room) return;

    try {
      // Check room conflict (exclude current class being edited)
      const roomCheck = await conflictAPI.checkRoom({
        room: slot.room,
        day: day,
        startTime: slot.start,
        endTime: slot.end,
        excludeClassId: id ? Number(id) : undefined
      });

      // Check teacher conflict (exclude current class being edited)
      const teacherCheck = await conflictAPI.checkTeacher({
        teacherId: currentTeacher.id,
        day: day,
        startTime: slot.start,
        endTime: slot.end,
        excludeClassId: id ? Number(id) : undefined
      });

      const conflictKey = `${day}-${slotIndex}`;
      setConflicts(prev => ({
        ...prev,
        [conflictKey]: {
          room: roomCheck.data,
          teacher: teacherCheck.data
        }
      }));
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  React.useEffect(() => {
    updateSchedule();
  }, [timeSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !currentTeacher || !id) return;
    
    const hasTimeSlots = Object.values(timeSlots).some(slots => slots.length > 0);
    if (!hasTimeSlots) {
      alert('Please add at least one time slot for the class.');
      return;
    }

    // Validate all time slots
    const invalidSlots = [];
    for (const [day, slots] of Object.entries(timeSlots)) {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot.start || !slot.end || !slot.room) {
          invalidSlots.push(`${day} slot ${i + 1}: Missing required fields`);
        } else if (slot.start >= slot.end) {
          invalidSlots.push(`${day} slot ${i + 1}: Start time must be earlier than end time`);
        }
      }
    }

    if (invalidSlots.length > 0) {
      alert('Please fix the following issues:\n' + invalidSlots.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await classAPI.update(Number(id), {
        title: formData.title,
        teacherId: currentTeacher.id,
        subject: formData.subject,
        schedule: JSON.stringify(schedule)
      });
      
      alert('Course updated successfully!');
      navigate('/my-courses');
    } catch (error) {
      alert('Error updating course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentTeacher) {
    return <div className="loading-message">Loading teacher information...</div>;
  }

  return (
    <div className="card">
      <h2>Edit Course</h2>
      <p>Teacher: <strong>{currentTeacher.name}</strong> | Subject: <strong>{currentTeacher.subject}</strong></p>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Course Title *</label>
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

        <div className="schedule-section">
          <h3>Schedule</h3>
          
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <div key={day} className="day-section" style={{ marginBottom: '1rem', border: '1px solid #e9ecef', borderRadius: '6px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{day}</h4>
                <button
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                >
                  + Add Time Slot
                </button>
              </div>
              
              {timeSlots[day]?.map((slot, index) => {
                const conflictKey = `${day}-${index}`;
                const conflict = conflicts[conflictKey];
                
                return (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div className="time-slot" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 2fr auto', 
                      gap: '0.5rem', 
                      alignItems: 'end',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <label style={{ fontSize: '0.8em', color: '#666', marginBottom: '2px', display: 'block' }}>
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            updateTimeSlot(day, index, 'start', e.target.value);
                            setTimeout(() => checkConflicts(day, index), 500);
                          }}
                          style={{ 
                            padding: '4px', 
                            width: '100%',
                            borderColor: slot.start && slot.end && slot.start >= slot.end ? '#dc3545' : '#ced4da'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8em', color: '#666', marginBottom: '2px', display: 'block' }}>
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            updateTimeSlot(day, index, 'end', e.target.value);
                            setTimeout(() => checkConflicts(day, index), 500);
                          }}
                          style={{ 
                            padding: '4px', 
                            width: '100%',
                            borderColor: slot.start && slot.end && slot.start >= slot.end ? '#dc3545' : '#ced4da'
                          }}
                          min={slot.start}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8em', color: '#666', marginBottom: '2px', display: 'block' }}>
                          Room *
                        </label>
                        <input
                          type="text"
                          value={slot.room}
                          onChange={(e) => {
                            updateTimeSlot(day, index, 'room', e.target.value);
                            setTimeout(() => checkConflicts(day, index), 500);
                          }}
                          placeholder="e.g., A203, Lab 1"
                          style={{ padding: '4px', width: '100%' }}
                        />
                      </div>
                      <div style={{ alignSelf: 'end' }}>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(day, index)}
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    {/* Time validation error */}
                    {slot.start && slot.end && slot.start >= slot.end && (
                      <div style={{ 
                        backgroundColor: '#f8d7da', 
                        border: '1px solid #f5c6cb', 
                        borderRadius: '4px', 
                        padding: '0.5rem', 
                        fontSize: '0.9em',
                        marginBottom: '0.25rem'
                      }}>
                        <strong>⚠️ Invalid Time:</strong> Start time must be earlier than end time
                      </div>
                    )}
                    
                    {/* Conflict warnings */}
                    {conflict && (
                      <div>
                        {conflict.room?.hasConflict && (
                          <div style={{ 
                            backgroundColor: '#fff3cd', 
                            border: '1px solid #ffeaa7', 
                            borderRadius: '4px', 
                            padding: '0.5rem', 
                            fontSize: '0.9em',
                            marginBottom: '0.25rem'
                          }}>
                            <strong>⚠️ Room Conflict:</strong> {conflict.room.message}
                            {conflict.room.conflicts.map((c: any, i: number) => (
                              <div key={i} style={{ marginLeft: '1rem', fontSize: '0.8em' }}>
                                • {c.classTitle} (Teacher: {c.teacherName})
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {conflict.teacher?.hasConflict && (
                          <div style={{ 
                            backgroundColor: '#f8d7da', 
                            border: '1px solid #f5c6cb', 
                            borderRadius: '4px', 
                            padding: '0.5rem', 
                            fontSize: '0.9em'
                          }}>
                            <strong>❌ Teacher Conflict:</strong> {conflict.teacher.message}
                            {conflict.teacher.conflicts.map((c: any, i: number) => (
                              <div key={i} style={{ marginLeft: '1rem', fontSize: '0.8em' }}>
                                • {c.classTitle}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!timeSlots[day] || timeSlots[day].length === 0) && (
                <div style={{ color: '#6c757d', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                  No classes scheduled for {day}
                </div>
              )}
            </div>
          ))}

          <div className="schedule-preview" style={{ 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef', 
            borderRadius: '6px', 
            marginTop: '1rem' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Schedule Preview</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {Object.entries(timeSlots).map(([day, slots]) => 
                slots.length > 0 && (
                  <div key={day} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{day}:</strong> {
                      slots.map((slot, i) => 
                        `${slot.start}-${slot.end} (${slot.room})`
                      ).join(', ')
                    }
                  </div>
                )
              )}
              {Object.values(timeSlots).every(slots => slots.length === 0) && (
                <div style={{ color: '#6c757d', fontStyle: 'italic' }}>No time slots added yet</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Course'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/my-courses')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;