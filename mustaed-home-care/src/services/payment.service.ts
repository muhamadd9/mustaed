import api from '@/lib/axios.config';

export interface Payment {
    _id: string;
    user: { _id: string; fullname: string; email: string; phone?: string } | string;
    plan: { _id: string; name: string; price: number; priceAfterDiscount: number } | string;
    subscription: { _id: string; status: string; startDate: string; endDate: string } | string | null;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId: string;
    paytabsTranRef: string;
    notes: string;
    createdAt: string;
}

export interface PaymentStats {
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    monthlyPayments: { _id: { year: number; month: number }; count: number; revenue: number }[];
}

export const paymentService = {
    getAll: async (page = 1, limit = 10, status?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/payment/all?${params}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/payment/stats');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/payment/${id}`);
        return response.data;
    },

    refund: async (id: string, notes?: string) => {
        const response = await api.post(`/payment/refund/${id}`, { notes });
        return response.data;
    },
};
