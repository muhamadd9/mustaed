import api from '@/lib/axios.config';

export interface User {
    _id: string;
    fullname: string;
    email?: string;
    phone?: string;
    city?: string;
    place?: string;
    district?: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const userService = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const response = await api.get(`/admin/users?${params}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/user/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<User>) => {
        const response = await api.patch(`/user/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    },
};
