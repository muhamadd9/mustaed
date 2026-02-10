import api from '@/lib/axios.config';
import Cookies from 'js-cookie';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/user/me'); // Check backend route, usually /user/me or /auth/me
        return response.data;
    },

    logout: () => {
        // Logic moved to AuthContext to use useNavigate
        Cookies.remove('token', { path: '/' });
        Cookies.remove('role', { path: '/' });
    },
};
