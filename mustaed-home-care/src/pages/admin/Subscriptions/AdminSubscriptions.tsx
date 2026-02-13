import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscriptionService, Subscription, SubscriptionStats } from '@/services/subscription.service';
import { Loader2, TrendingUp, Users, CheckCircle, XCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-100 text-green-700' },
    expired: { label: 'منتهي', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600' },
};

const AdminSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const limit = 10;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [subsRes, statsRes] = await Promise.all([
                subscriptionService.getAll(page, limit, statusFilter || undefined),
                subscriptionService.getStats()
            ]);

            if (subsRes.success) {
                setSubscriptions(subsRes.data.subscriptions);
                setTotalPages(subsRes.data.pagination.totalPages);
                setTotal(subsRes.data.pagination.total);
            }
            if (statsRes.success) {
                setStats(statsRes.data.stats);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في جلب البيانات');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, statusFilter]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-SA') + ' ريال';
    };

    if (isLoading && !subscriptions.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">الاشتراكات</h1>
                <p className="text-gray-500 mt-2">إدارة ومتابعة جميع اشتراكات العملاء</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الاشتراكات</CardTitle>
                            <Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">الاشتراكات النشطة</CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الإيرادات</CardTitle>
                            <DollarSign className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">الملغية / المنتهية</CardTitle>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">
                                {stats.cancelledSubscriptions + stats.expiredSubscriptions}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Revenue by Plan + Monthly Revenue */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                الإيرادات حسب الباقة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.revenueByPlan.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.revenueByPlan.map((item) => {
                                        const percentage = stats.totalRevenue > 0
                                            ? (item.revenue / stats.totalRevenue) * 100
                                            : 0;
                                        return (
                                            <div key={item._id} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">{item._id || 'غير محدد'}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-muted-foreground">{item.count} اشتراك</span>
                                                        <span className="text-sm font-bold">{formatCurrency(item.revenue)}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-primary rounded-full h-2 transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                الإيرادات الشهرية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.monthlyRevenue.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.monthlyRevenue.map((item) => {
                                        const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                                        const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                                        return (
                                            <div key={`${item._id.year}-${item._id.month}`} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        {ARABIC_MONTHS[item._id.month - 1]} {item._id.year}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-muted-foreground">{item.count} اشتراك</span>
                                                        <span className="text-sm font-bold">{formatCurrency(item.revenue)}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 rounded-full h-2 transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Subscriptions Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>قائمة الاشتراكات ({total})</CardTitle>
                        <div className="flex gap-2">
                            {[
                                { value: '', label: 'الكل' },
                                { value: 'active', label: 'نشط' },
                                { value: 'expired', label: 'منتهي' },
                                { value: 'cancelled', label: 'ملغي' },
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
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <p className="text-gray-500 text-center py-12">لا توجد اشتراكات</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b text-sm text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">العميل</th>
                                            <th className="pb-3 font-medium">الباقة</th>
                                            <th className="pb-3 font-medium">السعر</th>
                                            <th className="pb-3 font-medium">تاريخ البدء</th>
                                            <th className="pb-3 font-medium">تاريخ الانتهاء</th>
                                            <th className="pb-3 font-medium">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {subscriptions.map((sub) => {
                                            const user = typeof sub.userId === 'object' ? sub.userId : null;
                                            const statusInfo = statusMap[sub.status] || statusMap.active;
                                            return (
                                                <tr key={sub._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div>
                                                            <p className="font-medium">{user?.fullname || '-'}</p>
                                                            <p className="text-xs text-muted-foreground">{user?.email || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-medium">{sub.planName}</td>
                                                    <td className="py-4 font-bold text-primary">{formatCurrency(sub.price)}</td>
                                                    <td className="py-4 text-muted-foreground">{formatDate(sub.startDate)}</td>
                                                    <td className="py-4 text-muted-foreground">{sub.endDate ? formatDate(sub.endDate) : '-'}</td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
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
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSubscriptions;
