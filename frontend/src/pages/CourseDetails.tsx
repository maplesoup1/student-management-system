import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { classAPI, teacherAPI, enrollmentAPI, studentAPI } from '../api';
import { Class, Teacher, Student } from '../types';
import { getScheduleForDisplay } from '../utils/scheduleUtils';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Class | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(parseInt(id));
    }
  }, [id]);

  const fetchCourseDetails = async (classId: number) => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const [courseRes, teachersRes, studentsRes] = await Promise.all([
        classAPI.getById(classId),
        teacherAPI.getAll(),
        studentAPI.getAll()
      ]);

      const courseData = courseRes.data;
      setCourse(courseData);

      const teacherData = teachersRes.data.find(t => t.id === courseData.teacherId);
      setTeacher(teacherData || null);

      const student = studentsRes.data.find(s => s.userId === currentUser.id);
      if (student) {
        setCurrentStudent(student);
        
        const enrollmentsRes = await enrollmentAPI.getByStudent(student.id);
        const enrolled = enrollmentsRes.data.some(e => e.classId === classId);
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('Error loading course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentStudent || !course) return;

    setEnrolling(true);
    try {
      await enrollmentAPI.create({
        studentId: currentStudent.id,
        classId: course.id
      });
      alert('Successfully enrolled in course!');
      setIsEnrolled(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error enrolling in course');
    } finally {
      setEnrolling(false);
    }
  };


  if (loading) {
    return <div className="loading-message">Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className="card">
        <p>Class not found</p>
        <Link to="/available-courses" className="btn btn-primary">
          Back to Available Courses
        </Link>
      </div>
    );
  }

  const schedule = getScheduleForDisplay(course.schedule);

  return (
    <div className="card">
      <div className="header">
        <div>
          <h2>{course.title}</h2>
          {isEnrolled && (
            <span className="badge badge-success" style={{ marginLeft: '1rem' }}>
              Enrolled
            </span>
          )}
        </div>
        <Link to="/available-courses" className="btn btn-secondary">
          Back to Courses
        </Link>
      </div>

      <div className="course-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3>Class Information</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>Title:</strong> {course.title}</p>
            {course.subject && <p><strong>Subject:</strong> {course.subject}</p>}
            <p><strong>Teacher:</strong> {teacher?.name || 'Unknown Teacher'}</p>
            {teacher?.subject && <p><strong>Teacher's Subject:</strong> {teacher.subject}</p>}
          </div>
        </div>

        <div>
          <h3>Schedule Details</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>Days:</strong> {schedule.days}</p>
            <p><strong>Time:</strong> {schedule.time}</p>
            <p><strong>Room:</strong> {schedule.room}</p>
          </div>
        </div>
      </div>

      {!isEnrolled && currentStudent && (
        <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <h3>Interested in this course?</h3>
          <p>Enroll now to join this course and start learning.</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Enroll in Class'}
          </button>
        </div>
      )}

      {isEnrolled && (
        <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <h3 style={{ color: '#155724' }}>You are enrolled in this course!</h3>
          <p style={{ color: '#155724' }}>Check your schedule and be ready for class.</p>
          <Link to="/my-enrollments" className="btn btn-success">
            View My Enrolled Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;