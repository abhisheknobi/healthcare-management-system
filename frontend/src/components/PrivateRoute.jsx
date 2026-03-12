import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if ((requiredRole && user.role !== requiredRole) || (!requiredRole && location.pathname === '/dashboard')) {
        switch (user.role) {
            case 'PATIENT': return <Navigate to="/dashboard/patient" replace />;
            case 'DOCTOR': return <Navigate to="/dashboard/doctor" replace />;
            case 'RECEPTIONIST': return <Navigate to="/dashboard/receptionist" replace />;
            case 'ADMIN': return <Navigate to="/dashboard/admin" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
