import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orderService, Order } from '@/services/order.service';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
    Loader2, MapPin, Clock, CheckCircle2, Hourglass, Plus,
    ClipboardList, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'قيد الانتظار', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: Hourglass },
    in_progress: { label: 'قيد التنفيذ', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: Clock },
    done: { label: 'مكتمل', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle2 },
};

const MyVisits = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const limit = 10;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [isAuthenticated, page, statusFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersRes, subRes] = await Promise.all([
                orderService.getMyOrders(page, limit, statusFilter || undefined),
                subscriptionService.getMySubscriptions()
            ]);

            if (ordersRes.success) {
                setOrders(ordersRes.data.orders);
                setTotalPages(ordersRes.data.pagination.totalPages);
            }
            if (subRes.success && subRes.data.current) {
                setSubscription(subRes.data.current);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في جلب البيانات');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('ar-SA', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-28 px-4" dir="rtl">
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">زياراتي</h1>
                        <p className="text-gray-500 mt-2">تتبع جميع طلبات الزيارة الخاصة بك</p>
                    </div>
                    {subscription && subscription.visits > 0 && (
                        <Button onClick={() => navigate('/request-visit')} className="gap-2">
                            <Plus className="w-4 h-4" />
                            طلب زيارة
                        </Button>
                    )}
                </div>

                {/* Visits Counter */}
                {subscription && (
                    <Card className="mb-6 border-primary/20 overflow-hidden">
                        <div className="bg-gradient-to-l from-primary to-primary/80 text-white p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-sm">الزيارات المتبقية</p>
                                        <p className="text-2xl font-bold">{subscription.visits} زيارة</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-white/80 text-sm">الباقة</p>
                                    <p className="font-semibold">{subscription.planName}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { value: '', label: 'الكل' },
                        { value: 'pending', label: 'قيد الانتظار' },
                        { value: 'in_progress', label: 'قيد التنفيذ' },
                        { value: 'done', label: 'مكتمل' },
                    ].map((filter) => (
                        <Button
                            key={filter.value}
                            variant={statusFilter === filter.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات زيارة</h3>
                            <p className="text-muted-foreground mb-6">لم تقم بطلب أي زيارة بعد</p>
                            {subscription && subscription.visits > 0 && (
                                <Button onClick={() => navigate('/request-visit')} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    طلب زيارة جديدة
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const config = statusConfig[order.status];
                            const StatusIcon = config.icon;
                            return (
                                <Card key={order._id} className={`border transition-all hover:shadow-md ${config.bgColor}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                {/* Status Badge */}
                                                <div className="flex items-center gap-2">
                                                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                                                    <span className={`text-sm font-semibold ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <span>{order.city} - {order.place} - {order.district}</span>
                                                </div>

                                                {/* Date */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                                                    <span>{formatDate(order.createdAt)} - {formatTime(order.createdAt)}</span>
                                                </div>

                                                {/* Notes */}
                                                {order.notes && (
                                                    <p className="text-sm text-gray-500 bg-white/60 rounded-lg p-2 mt-2">
                                                        {order.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4">
                                <p className="text-sm text-muted-foreground">
                                    صفحة {page} من {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                        السابق
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        التالي
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVisits;
