
import axios from '@/lib/axios.config';

export interface Plan {
    _id: string;
    name: string;
    subtitle?: string;
    description?: string;
    price: number;
    discountPercentage: number;
    priceAfterDiscount: number;
    features: string[];
    billingPeriod: 'yearly' | 'monthly';
    tag?: string;
    visits: number;
    isFeatured: boolean;
}

export const planService = {
    getAllPlans: async () => {
        const response = await axios.get('/plan');
        return response.data;
    },

    getPlanById: async (id: string) => {
        const response = await axios.get(`/plan/${id}`);
        return response.data;
    },

    createPlan: async (data: Omit<Plan, '_id'>) => {
        const response = await axios.post('/plan', data);
        return response.data;
    },

    updatePlan: async (id: string, data: Partial<Plan>) => {
        const response = await axios.put(`/plan/${id}`, data);
        return response.data;
    },

    deletePlan: async (id: string) => {
        const response = await axios.delete(`/plan/${id}`);
        return response.data;
    },
};
