import api from '@/lib/axios.config';

export interface Subscription {
    _id: string;
    userId: { _id: string; fullname: string; email: string; phone?: string } | string;
    planId: { _id: string; name: string; price: number; priceAfterDiscount: number } | string;
    planName: string;
    price: number;
    billingPeriod: 'yearly' | 'monthly';
    visits: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    createdAt: string;
}

export interface SubscriptionStats {
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    totalRevenue: number;
    revenueByPlan: { _id: string; count: number; revenue: number }[];
    monthlyRevenue: { _id: { year: number; month: number }; count: number; revenue: number }[];
}

export const subscriptionService = {
    subscribe: async (planId: string) => {
        const response = await api.post('/subscription/subscribe', { planId });
        return response.data;
    },

    getMySubscriptions: async () => {
        const response = await api.get('/subscription/me');
        return response.data;
    },

    getAll: async (page = 1, limit = 10, status?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/subscription/all?${params}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/subscription/stats');
        return response.data;
    },
};
