import React, { useState, useEffect } from 'react';
import { userAPI, classAPI } from '../api';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        userAPI.getAll(),
        classAPI.getAll()
      ]);

      const users = usersRes.data;
      const courses = coursesRes.data;

      setStats({
        totalUsers: users.length,
        totalStudents: users.filter(u => u.role === 'STUDENT').length,
        totalTeachers: users.filter(u => u.role === 'TEACHER').length,
        totalCourses: courses.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading dashboard...</div>;
  }

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Students</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalTeachers}</h3>
          <p>Teachers</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalCourses}</h3>
          <p>Courses</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;