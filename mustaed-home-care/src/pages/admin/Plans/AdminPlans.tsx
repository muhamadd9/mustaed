
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService, Plan } from '@/services/plan.service';
import PlanCard from '@/components/admin/plans/PlanCard';
import PlanModal from '@/components/admin/plans/PlanModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminPlans = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

    // Fetch Plans
    const { data: response, isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: planService.getAllPlans
    });

    // Check if the response matches what we expect
    const plans: Plan[] = response?.data?.plans || response?.data || [];

    // Create Plan Mutation
    const createMutation = useMutation({
        mutationFn: planService.createPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            toast.success('تم إنشاء الباقة بنجاح');
            setIsModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الإنشاء');
        }
    });

    // Update Plan Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) => planService.updatePlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            toast.success('تم تحديث الباقة بنجاح');
            setIsModalOpen(false);
            setEditingPlan(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
        }
    });

    // Delete Plan Mutation
    const deleteMutation = useMutation({
        mutationFn: planService.deletePlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            toast.success('تم حذف الباقة بنجاح');
            setDeletingPlanId(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
        }
    });

    const handleCreate = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingPlanId(id);
    };

    const confirmDelete = () => {
        if (deletingPlanId) {
            deleteMutation.mutate(deletingPlanId);
        }
    };

    const handleSubmit = (data: Omit<Plan, '_id'>) => {
        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan._id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إدارة الباقات</h1>
                    <p className="text-muted-foreground mt-2">قم بإدارة باقات الاشتراك والأسعار والمميزات المعروضة للعملاء</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus size={20} /> إضافة باقة جديدة
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan._id}
                            plan={plan}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingPlan}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <AlertDialog open={!!deletingPlanId} onOpenChange={(open) => !open && setDeletingPlanId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن التراجع عن هذا الإجراء. سيتم حذف الباقة نهائياً من النظام.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminPlans;
