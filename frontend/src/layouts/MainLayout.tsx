
import { Link, Outlet } from 'react-router-dom';
import { User } from '../types';

const MainLayout: React.FC<{ currentUser: User | null; onLogout: () => void }> = ({ currentUser, onLogout }) => {

    return (
        <div className="container">
            <nav className="nav">
                <h1>Student Management System</h1>
                <ul>
                    {currentUser ? (
                        <>
                            {currentUser.role === 'STUDENT' && (
                                <>
                                    <li><Link to="/available-courses">Available Courses</Link></li>
                                    <li><Link to="/my-enrollments">My Enrolled Courses</Link></li>
                                </>
                            )}
                            {currentUser.role === 'TEACHER' && (
                                <>
                                    <li><Link to="/create-course">Create Class</Link></li>
                                    <li><Link to="/my-courses">My Courses</Link></li>
                                </>
                            )}
                            {currentUser.role === 'ADMIN' && (
                                <>
                                    <li><Link to="/admin-dashboard">Dashboard</Link></li>
                                    <li><Link to="/user-management">User Management</Link></li>
                                    <li><Link to="/course-management">Class Management</Link></li>
                                </>
                            )}
                            <li><button onClick={onLogout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                </ul>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
