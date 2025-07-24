import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import MyCourses from './pages/MyCourses';
import CourseStudents from './pages/CourseStudents';
import AvailableCourses from './pages/AvailableCourses';
import MyEnrollments from './pages/MyEnrollments';
import CourseDetails from './pages/CourseDetails';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CourseManagement from './pages/CourseManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAdmin from './pages/CreateAdmin';
import { User } from './types';
import { isTokenValid, clearAuthData } from './utils/tokenUtils';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        console.log('App.tsx useEffect - checking stored credentials');
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('Stored user:', storedUser);
        console.log('Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
        
        if (storedUser && storedToken) {
            if (isTokenValid(storedToken)) {
                // Token is valid, restore user session
                console.log('Token is valid, restoring user session');
                setCurrentUser(JSON.parse(storedUser));
            } else {
                // Token expired or invalid, clear storage
                console.log('Token expired or invalid, clearing storage');
                clearAuthData();
            }
        } else {
            console.log('No stored credentials found');
        }
    }, []);

    const handleLogin = (user: User) => {
        console.log('App.tsx handleLogin called with user:', user);
        setCurrentUser(user);
        console.log('currentUser state updated to:', user);
        // Note: token is already stored in Login component
    };

    const handleLogout = () => {
        clearAuthData();
        setCurrentUser(null);
    };

    console.log('App.tsx render - currentUser:', currentUser);
    console.log('App.tsx render - currentUser role:', currentUser?.role);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-admin" element={<CreateAdmin />} />
                <Route element={<MainLayout currentUser={currentUser} onLogout={handleLogout} />}>
                    <Route
                        path="/"
                        element={currentUser ? (
                            currentUser.role === 'STUDENT' ? (
                                <Navigate to="/available-courses" />
                            ) : currentUser.role === 'TEACHER' ? (
                                <Navigate to="/my-courses" />
                            ) : (
                                <Navigate to="/admin-dashboard" />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )}
                    />
                    
                    {/* Student Routes */}
                    <Route
                        path="/available-courses"
                        element={currentUser && currentUser.role === 'STUDENT' ? <AvailableCourses /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/my-enrollments"
                        element={currentUser && currentUser.role === 'STUDENT' ? <MyEnrollments /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/course-details/:id"
                        element={currentUser && currentUser.role === 'STUDENT' ? <CourseDetails /> : <Navigate to="/login" />}
                    />
                    
                    {/* Teacher Routes */}
                    <Route
                        path="/create-course"
                        element={currentUser && currentUser.role === 'TEACHER' ? <CreateCourse /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/edit-course/:id"
                        element={currentUser && currentUser.role === 'TEACHER' ? <EditCourse /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/my-courses"
                        element={currentUser && currentUser.role === 'TEACHER' ? <MyCourses /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/course-students/:id"
                        element={currentUser && currentUser.role === 'TEACHER' ? <CourseStudents /> : <Navigate to="/login" />}
                    />
                    
                    {/* Admin Routes */}
                    <Route
                        path="/admin-dashboard"
                        element={currentUser && currentUser.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/user-management"
                        element={currentUser && currentUser.role === 'ADMIN' ? <UserManagement /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/course-management"
                        element={currentUser && currentUser.role === 'ADMIN' ? <CourseManagement /> : <Navigate to="/login" />}
                    />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;