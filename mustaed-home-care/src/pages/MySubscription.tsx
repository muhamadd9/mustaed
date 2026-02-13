import { useEffect, useState } from 'react';
import { subscriptionService } from '@/services/subscription.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, CheckCircle, Package, History, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface CurrentSubscription {
    _id: string;
    planName: string;
    planId: { _id: string; name: string; features?: string[] } | null;
    price: number;
    billingPeriod: 'yearly' | 'monthly';
    visits: number;
    startDate: string;
    endDate: string;
    status: string;
    remainingDays: number;
    totalDays: number;
    elapsedDays: number;
    progressPercentage: number;
    createdAt: string;
}

interface HistorySubscription {
    _id: string;
    planName: string;
    price: number;
    billingPeriod: 'yearly' | 'monthly';
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
}

const MySubscription = () => {
    const [current, setCurrent] = useState<CurrentSubscription | null>(null);
    const [history, setHistory] = useState<HistorySubscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchSubscription();
    }, [isAuthenticated]);

    const fetchSubscription = async () => {
        try {
            const response = await subscriptionService.getMySubscriptions();
            if (response.success) {
                setCurrent(response.data.current);
                setHistory(response.data.history || []);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في جلب بيانات الاشتراك');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getDaysColor = (remaining: number, total: number) => {
        const ratio = remaining / total;
        if (ratio > 0.5) return 'text-green-600';
        if (ratio > 0.2) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (remaining: number, total: number) => {
        const ratio = remaining / total;
        if (ratio > 0.5) return 'bg-green-500';
        if (ratio > 0.2) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-28 px-4" dir="rtl">
            <div className="container mx-auto max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">اشتراكي</h1>
                    <p className="text-gray-500 mt-2">تفاصيل اشتراكك الحالي وسجل الاشتراكات السابقة</p>
                </div>

                {/* Current Subscription */}
                {current ? (
                    <Card className="mb-8 overflow-hidden border-primary/20">
                        <div className="bg-gradient-to-l from-primary to-primary/80 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm mb-1">الباقة الحالية</p>
                                    <h2 className="text-2xl font-bold">{current.planName}</h2>
                                </div>
                                <div className="bg-white/20 rounded-full px-4 py-1.5">
                                    <span className="text-sm font-medium">نشط</span>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-6 space-y-6">
                            {/* Remaining Days - Hero */}
                            <div className="text-center py-6 bg-gray-50 rounded-2xl">
                                <p className="text-sm text-muted-foreground mb-2">المدة المتبقية</p>
                                <div className={`text-5xl font-bold mb-1 ${getDaysColor(current.remainingDays, current.totalDays)}`}>
                                    {current.remainingDays}
                                </div>
                                <p className="text-muted-foreground">يوم متبقي من أصل {current.totalDays} يوم</p>

                                {/* Progress Bar */}
                                <div className="mt-4 mx-auto max-w-sm">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`rounded-full h-3 transition-all duration-700 ${getProgressColor(current.remainingDays, current.totalDays)}`}
                                            style={{ width: `${100 - current.progressPercentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>تاريخ الانتهاء</span>
                                        <span>تاريخ البدء</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">تاريخ الاشتراك</p>
                                        <p className="text-sm font-medium">{formatDate(current.startDate)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">تاريخ الانتهاء</p>
                                        <p className="text-sm font-medium">{formatDate(current.endDate)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">نوع الاشتراك</p>
                                        <p className="text-sm font-medium">{current.billingPeriod === 'yearly' ? 'سنوي' : 'شهري'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">السعر</p>
                                        <p className="text-sm font-bold text-primary">{current.price} ريال</p>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Features */}
                            {current.planId && typeof current.planId === 'object' && current.planId.features && current.planId.features.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 mb-3">مميزات الباقة</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {current.planId.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-8">
                        <CardContent className="py-16 text-center">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد اشتراك حالي</h3>
                            <p className="text-muted-foreground mb-6">اشترك في إحدى باقاتنا للاستمتاع بخدماتنا</p>
                            <Button
                                onClick={() => navigate('/#packages')}
                                className="btn-hero-primary"
                            >
                                تصفح الباقات
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Subscription History */}
                {history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="w-5 h-5 text-gray-500" />
                                سجل الاشتراكات السابقة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {history.map((sub) => (
                                    <div
                                        key={sub._id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{sub.planName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">{sub.price} ريال</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                sub.status === 'expired'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {sub.status === 'expired' ? 'منتهي' : 'ملغي'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MySubscription;
