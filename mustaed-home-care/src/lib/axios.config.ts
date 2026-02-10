import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:3400', // Ensure this matches your backend URL from .env.dev
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Ensure backend expects 'Bearer ' prefix
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear storage
            Cookies.remove('token', { path: '/' });
            Cookies.remove('role', { path: '/' });
            // Do NOT hard redirect here to avoid refresh loops or losing state.
            // The UI (ProtectedRoute or Context) will react to the missing token.
        }
        return Promise.reject(error);
    }
);

export default api;
