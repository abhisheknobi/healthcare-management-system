import axios from 'axios';

// Base URL points to the Spring Boot Backend running locally
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

// Intercept requests and attach the JWT token if it exists in local storage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses. If a 401 is received, forcefully log the user out
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle Unauthorized errors by wiping local storage and redirecting
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
