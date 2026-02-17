import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentService, Payment, PaymentStats } from '@/services/payment.service';
import {
    Loader2, TrendingUp, CheckCircle, XCircle, DollarSign,
    ChevronLeft, ChevronRight, Clock, RotateCcw, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
    failed: { label: 'فشل', color: 'bg-red-100 text-red-700' },
    refunded: { label: 'مسترد', color: 'bg-blue-100 text-blue-700' },
};

const AdminPayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const limit = 10;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paymentsRes, statsRes] = await Promise.all([
                paymentService.getAll(page, limit, statusFilter || undefined),
                paymentService.getStats()
            ]);

            if (paymentsRes.success) {
                setPayments(paymentsRes.data.payments);
                setTotalPages(paymentsRes.data.pagination.totalPages);
                setTotal(paymentsRes.data.pagination.total);
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

    const handleRefund = async () => {
        if (!refundingId) return;
        setIsRefunding(true);
        try {
            const res = await paymentService.refund(refundingId);
            if (res.success) {
                toast.success('تم استرداد المبلغ بنجاح');
                setRefundingId(null);
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في عملية الاسترداد');
        } finally {
            setIsRefunding(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-SA') + ' ريال';
    };

    if (isLoading && !payments.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">المدفوعات</h1>
                <p className="text-gray-500 mt-2">إدارة ومتابعة جميع عمليات الدفع</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">إجمالي العمليات</CardTitle>
                            <CreditCard className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPayments}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">مكتملة</CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completedPayments}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">قيد الانتظار</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">فاشلة</CardTitle>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.failedPayments}</div>
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
                </div>
            )}

            {/* Monthly Revenue Chart */}
            {stats && stats.monthlyPayments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            الإيرادات الشهرية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.monthlyPayments.map((item) => {
                                const maxRevenue = Math.max(...stats.monthlyPayments.map(m => m.revenue));
                                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={`${item._id.year}-${item._id.month}`} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                {ARABIC_MONTHS[item._id.month - 1]} {item._id.year}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">{item.count} عملية</span>
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
                    </CardContent>
                </Card>
            )}

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>سجل المدفوعات ({total})</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: '', label: 'الكل' },
                                { value: 'completed', label: 'مكتمل' },
                                { value: 'pending', label: 'قيد الانتظار' },
                                { value: 'failed', label: 'فشل' },
                                { value: 'refunded', label: 'مسترد' },
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
                    ) : payments.length === 0 ? (
                        <p className="text-gray-500 text-center py-12">لا توجد مدفوعات</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b text-sm text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">التاريخ</th>
                                            <th className="pb-3 font-medium">العميل</th>
                                            <th className="pb-3 font-medium">الباقة</th>
                                            <th className="pb-3 font-medium">المبلغ</th>
                                            <th className="pb-3 font-medium">مرجع المعاملة</th>
                                            <th className="pb-3 font-medium">الحالة</th>
                                            <th className="pb-3 font-medium">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {payments.map((payment) => {
                                            const user = typeof payment.user === 'object' ? payment.user : null;
                                            const plan = typeof payment.plan === 'object' ? payment.plan : null;
                                            const statusInfo = statusMap[payment.status] || statusMap.pending;
                                            return (
                                                <tr key={payment._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 pr-4 text-muted-foreground">
                                                        {formatDateTime(payment.createdAt)}
                                                    </td>
                                                    <td className="py-4">
                                                        <div>
                                                            <p className="font-medium">{user?.fullname || '-'}</p>
                                                            <p className="text-xs text-muted-foreground">{user?.email || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-medium">{plan?.name || '-'}</td>
                                                    <td className="py-4 font-bold text-primary">{formatCurrency(payment.amount)}</td>
                                                    <td className="py-4">
                                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {payment.paytabsTranRef || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        {payment.status === 'completed' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => setRefundingId(payment._id)}
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5 ml-1" />
                                                                استرداد
                                                            </Button>
                                                        )}
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

            {/* Refund Confirmation Dialog */}
            <Dialog open={!!refundingId} onOpenChange={(open) => !open && setRefundingId(null)}>
                <DialogContent dir="rtl" className="sm:max-w-md">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-xl">تأكيد الاسترداد</DialogTitle>
                        <DialogDescription className="text-right">
                            هل أنت متأكد من استرداد هذه العملية؟ سيتم إرسال طلب استرداد إلى PayTabs.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setRefundingId(null)}
                            disabled={isRefunding}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleRefund}
                            disabled={isRefunding}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isRefunding ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'تأكيد الاسترداد'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPayments;
