/**
 * API Service Configuration
 * Axios instance with interceptors for backend communication
 */
import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { ApiError } from '../types';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with defaults
export const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for quantum simulations
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add timestamp for debugging
        config.headers['X-Request-Time'] = new Date().toISOString();
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<ApiError>) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.error('Bad Request:', data?.detail || 'Invalid request parameters');
                    break;
                case 422:
                    console.error('Validation Error:', data?.detail || 'Input validation failed');
                    break;
                case 500:
                    console.error('Server Error:', data?.detail || 'Quantum simulation failed');
                    break;
                default:
                    console.error(`Error ${status}:`, data?.detail || 'Unknown error');
            }
        } else if (error.request) {
            console.error('Network Error: Unable to reach the server');
        }

        return Promise.reject(error);
    }
);

export default api;
