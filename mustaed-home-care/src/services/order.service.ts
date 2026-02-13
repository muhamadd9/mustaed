import api from '@/lib/axios.config';

export interface Order {
    _id: string;
    userId: { _id: string; fullname: string; email: string; phone?: string; city?: string; place?: string; district?: string } | string;
    subscriptionId: { _id: string; planName: string; visits: number; startDate?: string; endDate?: string } | string;
    city: string;
    place: string;
    district: string;
    notes?: string;
    status: 'pending' | 'in_progress' | 'done';
    createdAt: string;
    updatedAt: string;
}

export interface OrderStats {
    total: number;
    pending: number;
    in_progress: number;
    done: number;
}

export const orderService = {
    create: async (data: { city: string; place: string; district: string; notes?: string }) => {
        const response = await api.post('/order', data);
        return response.data;
    },

    getMyOrders: async (page = 1, limit = 10, status?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/order/me?${params}`);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, status?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/order/all?${params}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/order/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: 'in_progress' | 'done') => {
        const response = await api.patch(`/order/${id}/status`, { status });
        return response.data;
    },
};
