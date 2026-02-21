import { useEffect, useState } from 'react';
import { Check, Star, Sparkles, Loader2, ClipboardList, AlertTriangle, ShieldCheck, ArrowRight, Home, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan, planService } from '@/services/plan.service';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

const Plans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const currentSubscription = user?.subscription;
    const currentPlanId = currentSubscription?.planId?._id || currentSubscription?.planId;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await planService.getAllPlans();
                if (response?.data?.plans) {
                    setPlans(response.data.plans);
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSubscribeClick = (plan: Plan) => {
        if (!isAuthenticated) {
            toast.info('يرجى تسجيل الدخول أولاً للاشتراك', { position: 'top-center' });
            navigate('/login');
            return;
        }
        setSelectedPlan(plan);
    };

    const handleConfirmSubscribe = async () => {
        if (!selectedPlan) return;
        setIsSubscribing(true);
        try {
            const response = await subscriptionService.subscribe(selectedPlan._id);
            if (response.success && response.data?.redirect_url) {
                toast.info('جاري تحويلك لصفحة الدفع...', { position: 'top-center' });
                window.location.href = response.data.redirect_url;
            } else {
                toast.error('فشل في إنشاء صفحة الدفع');
                setIsSubscribing(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الاشتراك');
            setIsSubscribing(false);
        }
    };

    const isCurrentPlan = (planId: string) => currentPlanId === planId;

    const planIcons = [Crown, Star, Zap, Sparkles];

    return (
        <div className="min-h-screen" dir="rtl">
            {/* Hero Header */}
            <div className="relative overflow-hidden pt-16 pb-16" style={{ background: 'var(--gradient-primary)' }}>
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl bg-white" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl bg-white" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors duration-200 group"
                    >
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-medium">العودة للرئيسية</span>
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2 rounded-full mb-5 text-sm font-semibold border border-white/20">
                            <Star className="w-4 h-4 fill-white" />
                            باقات مصممة لراحتك
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            باقات الاشتراك
                        </h1>
                        <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto">
                            اختر الباقة التي تناسب احتياجاتك واستمتع بخدمات صيانة وتنظيف احترافية طوال العام
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-8 mt-10">
                            <div className="flex items-center gap-2 text-white/90">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm">ضمان الجودة</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm">فنيون معتمدون</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm">دعم 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave bottom */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="hsl(270 33% 97%)" />
                    </svg>
                </div>
            </div>

            {/* Plans Content */}
            <div className="bg-background py-16">
                <div className="container mx-auto px-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground">جاري تحميل الباقات...</p>
                        </div>
                    ) : !plans.length ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-lg">لا توجد باقات متاحة حالياً</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {plans.map((plan, index) => {
                                    const IconComponent = plan.isFeatured ? Crown : planIcons[index % planIcons.length];
                                    const isCurrent = isCurrentPlan(plan._id);

                                    return (
                                        <div
                                            key={plan._id}
                                            className={`relative rounded-3xl transition-all duration-500 overflow-hidden group ${plan.isFeatured
                                                    ? 'ring-2 ring-primary shadow-2xl'
                                                    : 'ring-1 ring-border/50 shadow-lg hover:shadow-2xl hover:-translate-y-1'
                                                } ${isCurrent ? 'ring-2 ring-green-400 shadow-green-100 shadow-xl' : ''}`}
                                        >
                                            {/* Featured gradient background */}
                                            {plan.isFeatured && (
                                                <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'var(--gradient-primary)' }} />
                                            )}

                                            {/* Top Tag Badge */}
                                            {(plan.isFeatured || plan.tag) && (
                                                <div className="absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl z-10"
                                                    style={{ background: 'var(--gradient-primary)' }}>
                                                    {plan.tag || '⭐ الأكثر طلباً'}
                                                </div>
                                            )}

                                            {/* Current Plan Badge */}
                                            {isCurrent && (
                                                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-2xl rounded-tl-3xl flex items-center gap-1.5 z-10">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    باقتك الحالية
                                                </div>
                                            )}

                                            <div className="bg-card p-8 h-full flex flex-col">
                                                {/* Icon & Name */}
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${plan.isFeatured ? 'text-white' : 'bg-primary/10'
                                                        }`} style={plan.isFeatured ? { background: 'var(--gradient-primary)' } : {}}>
                                                        <IconComponent className={`w-7 h-7 ${plan.isFeatured ? 'text-white' : 'text-primary'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                                        {plan.subtitle && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{plan.subtitle}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="mb-5 pb-5 border-b border-border/50">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-5xl font-extrabold text-primary">{plan.priceAfterDiscount}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-muted-foreground">ريال</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                / {plan.billingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {plan.price !== plan.priceAfterDiscount && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm line-through text-muted-foreground">{plan.price} ريال</span>
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                وفّر {Math.round(((plan.price - plan.priceAfterDiscount) / plan.price) * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Visits Badge */}
                                                {plan.visits > 0 && (
                                                    <div className="mb-5 flex items-center justify-center gap-2 rounded-xl py-3 px-4 border border-primary/20 bg-primary/5">
                                                        <ClipboardList className="w-5 h-5 text-primary flex-shrink-0" />
                                                        <span className="text-sm font-bold text-primary">{plan.visits} زيارة</span>
                                                        <span className="text-xs text-muted-foreground">متضمنة في الباقة</span>
                                                    </div>
                                                )}

                                                {/* Features */}
                                                <ul className="space-y-2.5 mb-8 flex-1">
                                                    {plan.features.slice(0, 6).map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Check className="w-3 h-3 text-primary" />
                                                            </div>
                                                            <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                                                        </li>
                                                    ))}
                                                    {plan.features.length > 6 && (
                                                        <li className="text-xs text-primary font-medium text-center pt-1">
                                                            + {plan.features.length - 6} مميزات إضافية أخرى
                                                        </li>
                                                    )}
                                                </ul>

                                                {/* CTA */}
                                                {isCurrent ? (
                                                    <div className="space-y-2">
                                                        <div className="text-center text-sm text-green-600 font-medium bg-green-50 rounded-xl py-2.5 border border-green-200">
                                                            ✓ مشترك حالياً — {currentSubscription?.visits ?? 0} زيارة متبقية
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full py-5 text-base border-primary/30 text-primary hover:bg-primary/5"
                                                            onClick={() => handleSubscribeClick(plan)}
                                                        >
                                                            تجديد الاشتراك
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        className={`w-full py-5 text-base font-bold transition-all duration-300 ${plan.isFeatured
                                                                ? 'text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border-0'
                                                            }`}
                                                        style={plan.isFeatured ? { background: 'var(--gradient-primary)' } : {}}
                                                        onClick={() => handleSubscribeClick(plan)}
                                                    >
                                                        اشترك الآن
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom CTA */}
                            <div className="text-center mt-16">
                                <p className="text-muted-foreground mb-4">هل تحتاج مساعدة في اختيار الباقة المناسبة؟</p>
                                <Button
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-white"
                                    onClick={() => navigate('/#contact')}
                                >
                                    تواصل معنا
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Subscription Confirmation Modal */}
            <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
                <DialogContent dir="rtl" className="sm:max-w-md">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-xl">
                            {currentSubscription ? 'تغيير الاشتراك' : 'تأكيد الاشتراك'}
                        </DialogTitle>
                        <DialogDescription className="text-right">
                            {currentSubscription
                                ? 'أنت على وشك تغيير اشتراكك الحالي'
                                : 'أنت على وشك الاشتراك في الباقة التالية'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlan && (
                        <div className="space-y-4 py-4">
                            {currentSubscription && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-semibold text-sm">تنبيه: اشتراكك الحالي سينتهي</span>
                                    </div>
                                    <div className="text-sm text-red-600 space-y-1 pr-7">
                                        <p>باقتك الحالية: <span className="font-bold">{currentSubscription.planName}</span></p>
                                        {currentSubscription.visits > 0 ? (
                                            <p className="flex items-center gap-1">
                                                <span>ستفقد</span>
                                                <span className="font-bold text-red-700 text-base">{currentSubscription.visits}</span>
                                                <span>زيارة متبقية</span>
                                            </p>
                                        ) : (
                                            <p>لا توجد زيارات متبقية في اشتراكك الحالي</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                                    {currentSubscription ? 'الباقة الجديدة' : 'تفاصيل الباقة'}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">الباقة</span>
                                    <span className="font-bold text-foreground">{selectedPlan.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">السعر</span>
                                    <span className="font-bold text-primary text-lg">{selectedPlan.priceAfterDiscount} ريال</span>
                                </div>
                                {selectedPlan.price !== selectedPlan.priceAfterDiscount && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">السعر قبل الخصم</span>
                                        <span className="line-through text-muted-foreground">{selectedPlan.price} ريال</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">مدة الاشتراك</span>
                                    <span className="font-medium">{selectedPlan.billingPeriod === 'yearly' ? 'سنوي' : 'شهري'}</span>
                                </div>
                                {selectedPlan.visits > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">عدد الزيارات</span>
                                        <span className="font-bold text-primary">{selectedPlan.visits} زيارة</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedPlan(null)}
                            disabled={isSubscribing}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleConfirmSubscribe}
                            disabled={isSubscribing}
                            className={`flex-1 ${currentSubscription ? 'bg-red-600 hover:bg-red-700' : 'btn-hero-primary'}`}
                        >
                            {isSubscribing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                    جاري التحويل للدفع...
                                </>
                            ) : currentSubscription ? (
                                'تأكيد التغيير والدفع'
                            ) : (
                                'متابعة الدفع'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Plans;
