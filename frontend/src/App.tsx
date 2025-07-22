import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClassForm from './components/ClassForm';
import ClassList from './components/ClassList';
import EnrollmentManagement from './components/EnrollmentManagement';
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="nav">
          <h1>Student Management System</h1>
          <ul>
            <li><Link to="/">📚 Classes</Link></li>
            <li><Link to="/create-class">➕ Create Class</Link></li>
            <li><Link to="/enrollments">👥 Enrollments</Link></li>
            <li><Link to="/teacher-dashboard">👨‍🏫 Teacher Dashboard</Link></li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<ClassList />} />
            <Route path="/create-class" element={<ClassForm />} />
            <Route path="/enrollments" element={<EnrollmentManagement />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;