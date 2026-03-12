import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

// Dashboards
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';

import AdminDashboard from './pages/dashboards/AdminDashboard';

// A simple routing component to bounce an authenticated user to their correct dashboard
const DashboardRedirect = () => {
    return (
        <PrivateRoute>
            {/* If PrivateRoute passes without a requiredRole, we know user exists. We bounce them to their role URL. */}
            {/* The actual logic for redirection is already handled gracefully inside PrivateRoute if they hit /dashboard. */}
        </PrivateRoute>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">

                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Dashboards */}
                            <Route path="/dashboard" element={<DashboardRedirect />} />

                            <Route path="/dashboard/patient" element={
                                <PrivateRoute requiredRole="PATIENT">
                                    <PatientDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/dashboard/doctor" element={
                                <PrivateRoute requiredRole="DOCTOR">
                                    <DoctorDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/dashboard/receptionist" element={
                                <PrivateRoute requiredRole="RECEPTIONIST">
                                    <ReceptionistDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/dashboard/admin" element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <AdminDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </main>

                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
