import React, { useState, useEffect } from 'react';
import { studentAPI } from '../api';
import { Student } from '../types';
import './StudentManagement.css';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, studentId: number | null, studentName: string}>({
        show: false,
        studentId: null,
        studentName: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getAll();
            setStudents(response.data);
        } catch (err) {
            setError('Failed to fetch students.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (student: Student) => {
        setDeleteConfirm({
            show: true,
            studentId: student.id,
            studentName: student.name
        });
    };

    const executeDelete = async () => {
        if (!deleteConfirm.studentId) return;
        
        try {
            setLoading(true);
            await studentAPI.delete(deleteConfirm.studentId);
            fetchStudents();
        } catch (err) {
            setError('Failed to delete student.');
            console.error(err);
        } finally {
            setLoading(false);
            setDeleteConfirm({show: false, studentId: null, studentName: ''});
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({show: false, studentId: null, studentName: ''});
    };

    if (loading) return <p className="loading-message">Loading students...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="student-management-container">
            <h2>🧑‍🎓 Student Management</h2>
            
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <p style={{ margin: 0, color: '#6c757d' }}>
                    📝 <strong>Note:</strong> Students can only be created through the registration system. 
                    Admin can view and remove students if necessary.
                </p>
            </div>

            <div className="header">
                <h3>📋 All Students</h3>
                <span className="badge">{students.length} students</span>
            </div>

            {students.length === 0 ? (
                <div className="empty-state">
                    <p>No students found.</p>
                </div>
            ) : (
                <div className="responsive-table">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td><strong>{student.name}</strong></td>
                                    <td>{student.email}</td>
                                    <td>{student.username || 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => showDeleteConfirm(student)}
                                            className="btn btn-danger btn-sm"
                                            disabled={loading}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>⚠️ Confirm Delete</h4>
                        <p>Are you sure you want to delete student <strong>{deleteConfirm.studentName}</strong>?</p>
                        <p style={{color: '#dc3545', fontSize: '0.9rem'}}>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={executeDelete} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;