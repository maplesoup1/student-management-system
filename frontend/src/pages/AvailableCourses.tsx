import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classAPI, enrollmentAPI, studentAPI, teacherAPI } from '../api';
import { Class, Student, Teacher, Enrollment } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import MessageDisplay from '../components/MessageDisplay';

const AvailableCourses: React.FC = () => {
  const [courses, setCourses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [enrolledTimeSlots, setEnrolledTimeSlots] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const { error, successMessage, handleError, clearError, clearSuccess, showSuccess } = useErrorHandler();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    clearError();
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!currentUser.id) {
        throw new Error('User session not found. Please log in again.');
      }
      
      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        classAPI.getAll(),
        teacherAPI.getAll(),
        studentAPI.getAll()
      ]);

      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);

      const student = studentsRes.data.find(s => s.userId === currentUser.id);
      if (student) {
        setCurrentStudent(student);
        
        const enrollmentsRes = await enrollmentAPI.getByStudent(student.id);
        setEnrolledTimeSlots(enrollmentsRes.data);
      } else {
        throw new Error('Student profile not found. Please contact administration.');
      }
    } catch (error: any) {
      handleError(error, 'Unable to load courses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollTimeSlot = async (classId: number, day: string, startTime: string, endTime: string, room: string) => {
    if (!currentStudent) {
      handleError(new Error('Student information not found'), 'Unable to enroll');
      return;
    }

    setEnrollingCourseId(classId);
    clearError();
    try {
      await enrollmentAPI.create({ 
        studentId: currentStudent.id, 
        classId: classId,
        day: day,
        startTime: startTime,
        endTime: endTime,
        room: room
      });
      
      showSuccess(`Successfully enrolled in ${day} ${startTime}-${endTime} time slot!`);
      // Refresh data to update enrolled status
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        handleError(error, 'You are already enrolled in this time slot or there is a schedule conflict.');
      } else {
        handleError(error, 'Failed to enroll in time slot. Please try again.');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };


  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  const isTimeSlotEnrolled = (classId: number, day: string, startTime: string, endTime: string) => {
    return enrolledTimeSlots.some(enrollment => 
      enrollment.classId === classId &&
      enrollment.day === day &&
      enrollment.startTime === startTime &&
      enrollment.endTime === endTime
    );
  };

  const hasTimeConflict = (day: string, startTime: string, endTime: string) => {
    return enrolledTimeSlots.some(enrollment => {
      if (enrollment.day !== day) return false;
      
      const enrolledStart = enrollment.startTime;
      const enrolledEnd = enrollment.endTime;
      
      if (!enrolledStart || !enrolledEnd) return false;
      
      // Check if times overlap
      return (startTime < enrolledEnd && endTime > enrolledStart);
    });
  };


  const availableCourses = courses
    .filter(course => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTeacher = !selectedTeacher || 
        course.teacherId.toString() === selectedTeacher;
      
      return matchesSearch && matchesTeacher;
    });

  if (loading) {
    return <div className="loading-message">Loading available courses...</div>;
  }

  if (!currentStudent) {
    return (
      <div className="card">
        <p>Student information not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <MessageDisplay 
        error={error} 
        success={successMessage} 
        onClearError={clearError} 
        onClearSuccess={clearSuccess} 
      />
      
      <div className="header">
        <h2>Available Courses</h2>
        <div>
          <span style={{ marginRight: '1rem', color: '#6c757d' }}>
            {availableCourses.length} courses available
          </span>
          <button className="btn btn-primary btn-sm" onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <input
            type="text"
            placeholder="Search by course title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id.toString()}>
                {teacher.name} - {teacher.subject}
              </option>
            ))}
          </select>
        </div>
        {(searchTerm || selectedTeacher) && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => {
              setSearchTerm('');
              setSelectedTeacher('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {availableCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          {searchTerm || selectedTeacher ? (
            <>
              <p>No courses match your search criteria.</p>
              <p>Try adjusting your search terms or clearing the filters.</p>
            </>
          ) : (
            <>
              <p>No courses available for enrollment at this time.</p>
              <p>Check back later or contact administration.</p>
            </>
          )}
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Class Title</th>
                <th>Teacher</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableCourses.map(course => {
                const schedule = JSON.parse(course.schedule);
                const timeSlots: Array<{
                  courseId: number;
                  courseTitle: string;
                  courseSubject?: string;
                  teacherId: number;
                  day: string;
                  startTime: string;
                  endTime: string;
                  room: string;
                }> = [];
                
                // Extract all time slots from the schedule
                Object.entries(schedule).forEach(([day, slots]) => {
                  if (Array.isArray(slots) && slots.length > 0) {
                    slots.forEach((slot: any) => {
                      timeSlots.push({
                        courseId: course.id,
                        courseTitle: course.title,
                        courseSubject: course.subject,
                        teacherId: course.teacherId,
                        day: day,
                        startTime: slot.start,
                        endTime: slot.end,
                        room: slot.room
                      });
                    });
                  }
                });
                
                return timeSlots.map((slot, index) => (
                  <tr key={`${course.id}-${slot.day}-${index}`}>
                    <td>
                      <Link to={`/course-details/${course.id}`} className="course-title-link">
                        <strong>{slot.courseTitle}</strong>
                      </Link>
                      {slot.courseSubject && (
                        <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                          {slot.courseSubject}
                        </div>
                      )}
                    </td>
                    <td>{getTeacherName(slot.teacherId)}</td>
                    <td>
                      <span className="subject-tag" style={{ textTransform: 'capitalize' }}>
                        {slot.day}
                      </span>
                    </td>
                    <td>
                      <span className="schedule-badge">
                        {slot.startTime}-{slot.endTime}
                      </span>
                    </td>
                    <td>
                      <span className="class-badge">
                        {slot.room}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const isEnrolled = isTimeSlotEnrolled(slot.courseId, slot.day, slot.startTime, slot.endTime);
                        const hasConflict = hasTimeConflict(slot.day, slot.startTime, slot.endTime);
                        const isEnrolling = enrollingCourseId === slot.courseId;
                        
                        if (isEnrolled) {
                          return (
                            <button 
                              className="btn btn-success btn-sm" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                minWidth: '100px',
                                justifyContent: 'center',
                                cursor: 'not-allowed'
                              }}
                              title="You are already enrolled in this time slot"
                              disabled
                            >
                              ✓ Enrolled
                            </button>
                          );
                        }
                        
                        if (hasConflict && !isEnrolled) {
                          return (
                            <button 
                              className="btn btn-warning btn-sm" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                justifyContent: 'center',
                                cursor: 'not-allowed',
                                minWidth: '80px'
                              }}
                              title={`This time slot conflicts with your existing schedule on ${slot.day}`}
                              disabled
                            >
                              ⚠️ Conflict
                            </button>
                          );
                        }
                        
                        if (loading) {
                          return (
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ 
                                minWidth: '80px',
                                justifyContent: 'center'
                              }}
                              disabled
                            >
                              Loading...
                            </button>
                          );
                        }
                        
                        return (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEnrollTimeSlot(
                              slot.courseId, 
                              slot.day, 
                              slot.startTime, 
                              slot.endTime, 
                              slot.room
                            )}
                            disabled={isEnrolling || loading}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              minWidth: '100px',
                              justifyContent: 'center'
                            }}
                            title={`Enroll in ${slot.courseTitle} - ${slot.day} ${slot.startTime}-${slot.endTime}`}
                          >
                            {isEnrolling ? (
                              <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                Enrolling...
                              </>
                            ) : (
                              <>
                                Enroll
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ));
              }).flat()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AvailableCourses;