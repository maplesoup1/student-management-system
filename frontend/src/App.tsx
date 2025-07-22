import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClassForm from './components/ClassForm';
import ClassList from './components/ClassList';
import EnrollmentForm from './components/EnrollmentForm';
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="nav">
          <ul>
            <li><Link to="/">Classes</Link></li>
            <li><Link to="/create-class">Create Class</Link></li>
            <li><Link to="/enroll">Enroll Student</Link></li>
            <li><Link to="/teacher-dashboard">Teacher Dashboard</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<ClassList />} />
          <Route path="/create-class" element={<ClassForm />} />
          <Route path="/enroll" element={<EnrollmentForm />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;