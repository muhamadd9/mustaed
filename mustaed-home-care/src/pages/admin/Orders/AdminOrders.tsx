import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { orderService, Order, OrderStats } from '@/services/order.service';
import { toast } from 'sonner';
import {
    Loader2, ClipboardList, Hourglass, Clock, CheckCircle2, Eye,
    ChevronLeft, ChevronRight, MapPin, User, Phone, Mail,
    CalendarDays, FileText, ArrowLeftRight
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; badgeColor: string; icon: any }> = {
    pending: { label: 'قيد الانتظار', color: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-700', icon: Hourglass },
    in_progress: { label: 'قيد التنفيذ', color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700', icon: Clock },
    done: { label: 'مكتمل', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const limit = 10;

    // Detail modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    // Status change confirmation
    const [statusChangeOrder, setStatusChangeOrder] = useState<Order | null>(null);
    const [statusChangeTarget, setStatusChangeTarget] = useState<'in_progress' | 'done' | null>(null);
    const [statusChanging, setStatusChanging] = useState(false);

    const fetchData = async (isInitial = false) => {
        if (isInitial) setInitialLoading(true);
        else setTableLoading(true);
        try {
            const res = await orderService.getAll(page, limit, statusFilter || undefined);
            if (res.success) {
                setOrders(res.data.orders);
                setStats(res.data.stats);
                setTotalPages(res.data.pagination.totalPages);
                setTotal(res.data.pagination.total);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في جلب البيانات');
        } finally {
            setInitialLoading(false);
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData(!stats);
    }, [page, statusFilter]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const openDetail = async (orderId: string) => {
        setDetailLoading(true);
        setShowDetail(true);
        try {
            const res = await orderService.getById(orderId);
            if (res.success) {
                setSelectedOrder(res.data.order);
            }
        } catch (error: any) {
            toast.error('حدث خطأ في جلب تفاصيل الطلب');
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusChange = async () => {
        if (!statusChangeOrder || !statusChangeTarget) return;
        setStatusChanging(true);
        try {
            const res = await orderService.updateStatus(statusChangeOrder._id, statusChangeTarget);
            if (res.success) {
                toast.success(res.message);
                // Update in local state
                setOrders(prev => prev.map(o =>
                    o._id === statusChangeOrder._id ? { ...o, status: statusChangeTarget } : o
                ));
                // Update selected order if detail is open
                if (selectedOrder && selectedOrder._id === statusChangeOrder._id) {
                    setSelectedOrder({ ...selectedOrder, status: statusChangeTarget });
                }
                // Refresh stats
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في تحديث الحالة');
        } finally {
            setStatusChanging(false);
            setStatusChangeOrder(null);
            setStatusChangeTarget(null);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">طلبات الزيارات</h1>
                <p className="text-gray-500 mt-2">إدارة ومتابعة جميع طلبات الزيارات</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الطلبات</CardTitle>
                            <ClipboardList className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">قيد الانتظار</CardTitle>
                            <Hourglass className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">قيد التنفيذ</CardTitle>
                            <Clock className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">مكتملة</CardTitle>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>قائمة الطلبات ({total})</CardTitle>
                        <div className="flex gap-2 flex-wrap">
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
                    </div>
                </CardHeader>
                <CardContent>
                    {!tableLoading && orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-12">لا توجد طلبات</p>
                    ) : (
                        <div className="relative">
                            {tableLoading && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b text-sm text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">العميل</th>
                                            <th className="pb-3 font-medium">الموقع</th>
                                            <th className="pb-3 font-medium">التاريخ</th>
                                            <th className="pb-3 font-medium">الحالة</th>
                                            <th className="pb-3 font-medium">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {orders.map((order) => {
                                            const user = typeof order.userId === 'object' ? order.userId : null;
                                            const config = statusConfig[order.status];
                                            return (
                                                <tr key={order._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div>
                                                            <p className="font-medium">{user?.fullname || '-'}</p>
                                                            <p className="text-xs text-muted-foreground">{user?.phone || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <p className="text-sm">{order.place} - {order.district}</p>
                                                    </td>
                                                    <td className="py-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.badgeColor}`}>
                                                            {config.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openDetail(order._id)}
                                                                className="gap-1 text-xs"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                عرض
                                                            </Button>
                                                            {order.status === 'pending' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                    onClick={() => {
                                                                        setStatusChangeOrder(order);
                                                                        setStatusChangeTarget('in_progress');
                                                                    }}
                                                                >
                                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                                    قيد التنفيذ
                                                                </Button>
                                                            )}
                                                            {(order.status === 'pending' || order.status === 'in_progress') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={() => {
                                                                        setStatusChangeOrder(order);
                                                                        setStatusChangeTarget('done');
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    مكتمل
                                                                </Button>
                                                            )}
                                                        </div>
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
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب</DialogTitle>
                        <DialogDescription>عرض كامل معلومات طلب الزيارة</DialogDescription>
                    </DialogHeader>

                    {detailLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : selectedOrder ? (
                        <div className="space-y-5">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">الحالة</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status]?.badgeColor}`}>
                                    {statusConfig[selectedOrder.status]?.label}
                                </span>
                            </div>

                            {/* User Info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-600">بيانات العميل</h4>
                                {(() => {
                                    const user = typeof selectedOrder.userId === 'object' ? selectedOrder.userId : null;
                                    return user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{user.fullname}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span dir="ltr">{user.phone}</span>
                                                </div>
                                            )}
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Location */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-600">موقع الزيارة</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{selectedOrder.city} - {selectedOrder.place} - {selectedOrder.district}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        ملاحظات
                                    </h4>
                                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="w-4 h-4" />
                                <span>تاريخ الطلب: {formatDateTime(selectedOrder.createdAt)}</span>
                            </div>

                            {/* Action Buttons */}
                            {selectedOrder.status !== 'done' && (
                                <div className="flex gap-3 pt-2 border-t">
                                    {selectedOrder.status === 'pending' && (
                                        <Button
                                            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                setStatusChangeOrder(selectedOrder);
                                                setStatusChangeTarget('in_progress');
                                            }}
                                        >
                                            <Clock className="w-4 h-4" />
                                            نقل إلى قيد التنفيذ
                                        </Button>
                                    )}
                                    <Button
                                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            setStatusChangeOrder(selectedOrder);
                                            setStatusChangeTarget('done');
                                        }}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        إكمال الطلب
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Status Change Confirmation */}
            <AlertDialog open={!!statusChangeOrder && !!statusChangeTarget} onOpenChange={(open) => {
                if (!open) {
                    setStatusChangeOrder(null);
                    setStatusChangeTarget(null);
                }
            }}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد تغيير الحالة</AlertDialogTitle>
                        <AlertDialogDescription>
                            {statusChangeTarget === 'done'
                                ? 'هل أنت متأكد من إكمال هذا الطلب؟ سيتم خصم زيارة واحدة من اشتراك العميل.'
                                : 'هل أنت متأكد من نقل هذا الطلب إلى قيد التنفيذ؟'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-2 flex-row-reverse sm:flex-row-reverse">
                        <AlertDialogCancel disabled={statusChanging}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusChange}
                            disabled={statusChanging}
                            className={statusChangeTarget === 'done' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                        >
                            {statusChanging ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'تأكيد'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminOrders;
