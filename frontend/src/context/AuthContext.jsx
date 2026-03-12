import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On app load, check local storage for existing session
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken } = response.data;

            // In a real app we'd decode the JWT to get the user context (roles, id, etc.)
            // For now, after getting the token, we can just hit a generic /me profile endpoint 
            // if we had one. Or we can just temporarily parse the JWT.
            // Let's implement a rudimentary JWT parser to extract the role and email

            const payload = JSON.parse(atob(accessToken.split('.')[1]));

            const userData = {
                email: payload.sub,
                role: payload.roles || 'PATIENT', // Fallback role
                // Spring security usually drops roles in a 'roles' claim or 'Authorities'
            };

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
