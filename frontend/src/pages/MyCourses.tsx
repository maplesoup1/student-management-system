import React, { useState, useEffect } from 'react';
import { classAPI, teacherAPI, enrollmentAPI } from '../api';
import { Class, Teacher, Enrollment } from '../types';
import { formatScheduleForTable } from '../utils/scheduleUtils';
import { Link } from 'react-router-dom';

const MyCourses: React.FC = () => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<{[classId: number]: Enrollment[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username) {
        const teachersResponse = await teacherAPI.getAll();
        const teacher = teachersResponse.data.find(t => t.username === user.username);
        
        if (teacher) {
          setCurrentTeacher(teacher);
          
          const classesResponse = await classAPI.getByTeacher(teacher.id);
          const teacherClasses = classesResponse.data;
          setClasses(teacherClasses);

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
        }
      }
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      alert('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCourse = async (classId: number) => {
    if (!window.confirm('Are you sure you want to cancel this entire course? This action cannot be undone.')) {
      return;
    }

    try {
      await classAPI.delete(classId);
      alert('Course cancelled successfully');
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error cancelling course:', error);
      alert('Error cancelling course');
    }
  };

  const handleCancelTimeSlot = async (classId: number, day: string, startTime: string, endTime: string) => {
    const timeSlotInfo = `${day} ${startTime}-${endTime}`;
    if (!window.confirm(`Are you sure you want to cancel the time slot: ${timeSlotInfo}? All student enrollments for this time slot will be removed.`)) {
      return;
    }

    try {
      // First, get the current class to modify its schedule
      const classItem = classes.find(c => c.id === classId);
      if (!classItem) {
        alert('Class not found');
        return;
      }

      // Parse the current schedule
      const currentSchedule = classItem.schedule;
      
      // Remove the specific time slot from the schedule
      if (currentSchedule[day]) {
        currentSchedule[day] = currentSchedule[day].filter(
          (slot: any) => !(slot.start === startTime && slot.end === endTime)
        );
      }

      // Update the class with the modified schedule
      await classAPI.update(classId, {
        ...classItem,
        schedule: currentSchedule
      });

      // Remove all enrollments for this specific time slot
      const classEnrollments = enrollments[classId] || [];
      const timeSlotEnrollments = classEnrollments.filter(
        e => e.day === day && e.startTime === startTime && e.endTime === endTime
      );
      
      // Delete each enrollment for this time slot
      await Promise.all(timeSlotEnrollments.map(enrollment => 
        enrollmentAPI.delete(enrollment.id)
      ));

      alert(`Time slot ${timeSlotInfo} has been cancelled successfully`);
      fetchTeacherCourses();
    } catch (error) {
      console.error('Error cancelling time slot:', error);
      alert('Error cancelling time slot');
    }
  };


  if (loading) {
    return <div className="loading-message">Loading your courses...</div>;
  }

  if (!currentTeacher) {
    return <div className="card">Teacher information not found</div>;
  }

  return (
    <div className="card">
      <div className="header">
        <h2>My Courses</h2>
        <div>
          <span style={{ marginRight: '1rem', color: '#6c757d' }}>
            {currentTeacher.name} - {currentTeacher.subject}
          </span>
          <button className="btn btn-primary btn-sm" onClick={fetchTeacherCourses}>
            Refresh
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>You haven't created any courses yet.</p>
          <Link to="/create-course" className="btn btn-primary">
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="responsive-table">
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(classItem => {
                const classEnrollments = enrollments[classItem.id] || [];
                
                // Extract all time slots from the schedule
                const timeSlots: Array<{day: string, start: string, end: string, room: string}> = [];
                Object.entries(classItem.schedule).forEach(([day, slots]) => {
                  if (Array.isArray(slots)) {
                    slots.forEach((slot: any) => {
                      timeSlots.push({
                        day: day,
                        start: slot.start,
                        end: slot.end,
                        room: slot.room || 'N/A'
                      });
                    });
                  }
                });

                // If no time slots, show one row for the course
                if (timeSlots.length === 0) {
                  return (
                    <tr key={classItem.id}>
                      <td>
                        <strong>{classItem.title}</strong>
                        {classItem.subject && <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                          {classItem.subject}
                        </div>}
                      </td>
                      <td colSpan={3} style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No schedule configured
                      </td>
                      <td>
                        <Link 
                          to={`/course-students/${classItem.id}`}
                          className="student-count-link"
                        >
                          {classEnrollments.length} students
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link 
                            to={`/edit-course/${classItem.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelCourse(classItem.id)}
                          >
                            Cancel Course
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Show each time slot as a separate row
                return timeSlots.map((slot, index) => {
                  const slotEnrollments = classEnrollments.filter(
                    e => e.day === slot.day && e.startTime === slot.start && e.endTime === slot.end
                  );
                  
                  return (
                    <tr key={`${classItem.id}-${slot.day}-${slot.start}-${slot.end}`}>
                      <td>
                        {index === 0 && (
                          <>
                            <strong>{classItem.title}</strong>
                            {classItem.subject && <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                              {classItem.subject}
                            </div>}
                          </>
                        )}
                      </td>
                      <td>
                        <span className="subject-tag" style={{ textTransform: 'capitalize' }}>
                          {slot.day}
                        </span>
                      </td>
                      <td>
                        <span className="schedule-badge">
                          {slot.start}-{slot.end}
                        </span>
                      </td>
                      <td>
                        <span className="class-badge">
                          {slot.room}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/course-students/${classItem.id}`}
                          className="student-count-link"
                          title={`Students enrolled in ${slot.day} ${slot.start}-${slot.end}`}
                        >
                          {slotEnrollments.length} students
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {index === 0 && (
                            <Link 
                              to={`/edit-course/${classItem.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Edit
                            </Link>
                          )}
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCancelTimeSlot(classItem.id, slot.day, slot.start, slot.end)}
                            title={`Cancel ${slot.day} ${slot.start}-${slot.end} time slot`}
                          >
                            Cancel Time Slot
                          </button>
                          {index === 0 && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelCourse(classItem.id)}
                              title="Cancel entire course"
                            >
                              Cancel Course
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyCourses;