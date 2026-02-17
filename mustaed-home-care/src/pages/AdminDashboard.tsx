import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, CreditCard, CheckCircle, Clock, DollarSign, TrendingUp,
    Package, ClipboardList, Loader2, XCircle, RotateCcw, UserPlus,
    Wallet, AlertCircle
} from "lucide-react";
import api from "@/lib/axios.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const paymentStatusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
    failed: { label: 'فشل', color: 'bg-red-100 text-red-700' },
    refunded: { label: 'مسترد', color: 'bg-blue-100 text-blue-700' },
};

const subStatusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-100 text-green-700' },
    expired: { label: 'منتهي', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600' },
};

interface DashboardData {
    users: { total: number; active: number; newThisMonth: number };
    subscriptions: { total: number; active: number; expired: number; cancelled: number };
    payments: {
        total: number; completed: number; pending: number; failed: number;
        refunded: number; totalRevenue: number; revenueThisMonth: number;
    };
    orders: { total: number; pending: number; inProgress: number; done: number };
    plans: { total: number };
    charts: {
        monthlyRevenue: { _id: { year: number; month: number }; count: number; revenue: number }[];
        monthlyUsers: { _id: { year: number; month: number }; count: number }[];
        revenueByPlan: { _id: string; count: number; revenue: number }[];
    };
    recent: {
        payments: any[];
        subscriptions: any[];
    };
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/stats");
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || "حدث خطأ في جلب البيانات");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => amount.toLocaleString("ar-SA") + " ريال";

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" });

    const formatDateTime = (date: string) =>
        new Date(date).toLocaleDateString("ar-SA", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">لم يتم تحميل البيانات</p>
            </div>
        );
    }

    const successRate = data.payments.total > 0
        ? Math.round((data.payments.completed / data.payments.total) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-500 mt-2">
                    مرحباً بك، {user?.fullname || "المسؤول"}. إليك نظرة عامة على النظام.
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/admin/users")}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">المستخدمين</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.users.total}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <UserPlus className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                                +{data.users.newThisMonth} هذا الشهر
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/admin/subscriptions")}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">الاشتراكات النشطة</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.subscriptions.active}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            من أصل {data.subscriptions.total} اشتراك
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/admin/payments")}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(data.payments.totalRevenue)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(data.payments.revenueThisMonth)} هذا الشهر
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/admin/orders")}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">طلبات الزيارات</CardTitle>
                        <ClipboardList className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.orders.total}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                                {data.orders.pending} بانتظار المعالجة
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <Wallet className="h-5 w-5 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-green-600">{data.payments.completed}</p>
                        <p className="text-xs text-gray-500 mt-1">دفعات ناجحة</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <Clock className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold text-yellow-600">{data.payments.pending}</p>
                        <p className="text-xs text-gray-500 mt-1">قيد الانتظار</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <XCircle className="h-5 w-5 mx-auto text-red-500 mb-2" />
                        <p className="text-2xl font-bold text-red-600">{data.payments.failed}</p>
                        <p className="text-xs text-gray-500 mt-1">فاشلة</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <RotateCcw className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{data.payments.refunded}</p>
                        <p className="text-xs text-gray-500 mt-1">مستردة</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <Package className="h-5 w-5 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold text-purple-600">{data.plans.total}</p>
                        <p className="text-xs text-gray-500 mt-1">الباقات</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
                        <p className="text-2xl font-bold text-emerald-600">{successRate}%</p>
                        <p className="text-xs text-gray-500 mt-1">نسبة النجاح</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            الإيرادات الشهرية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.charts.monthlyRevenue.length > 0 ? (
                            <div className="space-y-3">
                                {data.charts.monthlyRevenue.map((item) => {
                                    const maxRevenue = Math.max(...data.charts.monthlyRevenue.map(m => m.revenue));
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
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-l from-green-400 to-green-600 rounded-full h-2.5 transition-all duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد بيانات إيرادات بعد</p>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-5 w-5 text-primary" />
                            الإيرادات حسب الباقة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.charts.revenueByPlan.length > 0 ? (
                            <div className="space-y-4">
                                {data.charts.revenueByPlan.map((item) => {
                                    const totalRev = data.charts.revenueByPlan.reduce((s, i) => s + i.revenue, 0);
                                    const percentage = totalRev > 0 ? (item.revenue / totalRev) * 100 : 0;
                                    return (
                                        <div key={item._id || "unknown"} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">{item._id || "غير محدد"}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground">{item.count} عملية</span>
                                                    <span className="text-sm font-bold">{formatCurrency(item.revenue)}</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-l from-primary/70 to-primary rounded-full h-2.5 transition-all duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground text-left">{Math.round(percentage)}%</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد بيانات بعد</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Users Chart */}
            {data.charts.monthlyUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="h-5 w-5 text-blue-500" />
                            المستخدمين الجدد شهرياً
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.charts.monthlyUsers.map((item) => {
                                const maxUsers = Math.max(...data.charts.monthlyUsers.map(m => m.count));
                                const percentage = maxUsers > 0 ? (item.count / maxUsers) * 100 : 0;
                                return (
                                    <div key={`${item._id.year}-${item._id.month}`} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                {ARABIC_MONTHS[item._id.month - 1]} {item._id.year}
                                            </span>
                                            <span className="text-sm font-bold">{item.count} مستخدم</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="bg-gradient-to-l from-blue-400 to-blue-600 rounded-full h-2.5 transition-all duration-700"
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

            {/* Orders Breakdown + Subscriptions Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ClipboardList className="h-5 w-5 text-orange-500" />
                            توزيع طلبات الزيارات
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.orders.total > 0 ? (
                            <div className="space-y-4">
                                {[
                                    { label: "قيد الانتظار", count: data.orders.pending, color: "bg-yellow-500", textColor: "text-yellow-600" },
                                    { label: "قيد التنفيذ", count: data.orders.inProgress, color: "bg-blue-500", textColor: "text-blue-600" },
                                    { label: "مكتملة", count: data.orders.done, color: "bg-green-500", textColor: "text-green-600" },
                                ].map((item) => {
                                    const percentage = data.orders.total > 0 ? (item.count / data.orders.total) * 100 : 0;
                                    return (
                                        <div key={item.label} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                                                    <span className="text-xs text-muted-foreground">({Math.round(percentage)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className={`${item.color} rounded-full h-2.5 transition-all duration-700`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد طلبات بعد</p>
                        )}
                    </CardContent>
                </Card>

                {/* Subscriptions Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-5 w-5 text-primary" />
                            توزيع الاشتراكات
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.subscriptions.total > 0 ? (
                            <div className="space-y-4">
                                {[
                                    { label: "نشط", count: data.subscriptions.active, color: "bg-green-500", textColor: "text-green-600" },
                                    { label: "منتهي", count: data.subscriptions.expired, color: "bg-gray-400", textColor: "text-gray-600" },
                                    { label: "ملغي", count: data.subscriptions.cancelled, color: "bg-red-500", textColor: "text-red-600" },
                                ].map((item) => {
                                    const percentage = data.subscriptions.total > 0 ? (item.count / data.subscriptions.total) * 100 : 0;
                                    return (
                                        <div key={item.label} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                                                    <span className="text-xs text-muted-foreground">({Math.round(percentage)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className={`${item.color} rounded-full h-2.5 transition-all duration-700`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد اشتراكات بعد</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">آخر المدفوعات</CardTitle>
                        <button
                            onClick={() => navigate("/admin/payments")}
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            عرض الكل
                        </button>
                    </CardHeader>
                    <CardContent>
                        {data.recent.payments.length > 0 ? (
                            <div className="space-y-3">
                                {data.recent.payments.map((payment: any) => {
                                    const statusInfo = paymentStatusMap[payment.status] || paymentStatusMap.pending;
                                    return (
                                        <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-primary">
                                                        {payment.user?.fullname?.charAt(0)?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {payment.user?.fullname || "-"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.plan?.name || "-"} - {formatDateTime(payment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left flex-shrink-0 mr-3">
                                                <p className="text-sm font-bold text-primary">{formatCurrency(payment.amount)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد مدفوعات بعد</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Subscriptions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">آخر الاشتراكات</CardTitle>
                        <button
                            onClick={() => navigate("/admin/subscriptions")}
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            عرض الكل
                        </button>
                    </CardHeader>
                    <CardContent>
                        {data.recent.subscriptions.length > 0 ? (
                            <div className="space-y-3">
                                {data.recent.subscriptions.map((sub: any) => {
                                    const statusInfo = subStatusMap[sub.status] || subStatusMap.active;
                                    return (
                                        <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-green-600">
                                                        {sub.userId?.fullname?.charAt(0)?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {sub.userId?.fullname || "-"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {sub.planName} - {formatDate(sub.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left flex-shrink-0 mr-3">
                                                <p className="text-sm font-bold">{formatCurrency(sub.price)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">لا توجد اشتراكات بعد</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
