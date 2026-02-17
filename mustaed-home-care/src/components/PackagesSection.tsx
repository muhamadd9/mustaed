import { useEffect, useState } from 'react';
import { Check, Star, Sparkles, Loader2, ClipboardList, AlertTriangle, ShieldCheck } from 'lucide-react';
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

const PackagesSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Get the user's current subscription from the /me data
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
        // Redirect to PayTabs hosted payment page
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

  const isCurrentPlan = (planId: string) => {
    return currentPlanId === planId;
  };

  if (isLoading) {
    return (
      <section id="packages" className="section-padding gradient-soft-bg">
        <div className="container mx-auto px-4 flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!plans.length) {
    return null;
  }

  return (
    <section id="packages" className="section-padding gradient-soft-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">باقات الاشتراك</span>
          <h2 className="section-title">اختر الباقة المناسبة لك</h2>
          <p className="section-subtitle">
            باقات متنوعة تناسب جميع الاحتياجات والميزانيات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.isFeatured ? Star : Sparkles;
            const isCurrent = isCurrentPlan(plan._id);

            return (
              <div
                key={plan._id}
                className={`relative ${plan.isFeatured ? 'card-package-featured scale-105' : 'card-package'} ${
                  isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                {(plan.isFeatured || plan.tag) && (
                  <div className="absolute top-0 right-0 gradient-bg text-white text-sm font-bold px-4 py-1 rounded-bl-2xl rounded-tr-3xl">
                    {plan.tag || 'الأكثر طلباً'}
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-2xl rounded-tl-3xl flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    باقتك الحالية
                  </div>
                )}

                <div className={`icon-container mb-6 ${plan.isFeatured ? 'bg-primary/20' : ''}`}>
                  <Icon className={`w-8 h-8 ${plan.isFeatured ? 'text-primary' : 'text-primary'}`} />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6 h-12 overflow-hidden">{plan.subtitle}</p>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">{plan.priceAfterDiscount}</span>
                  <span className="text-muted-foreground mr-2">
                    ريال / {plan.billingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}
                  </span>
                </div>

                {/* Visits Count */}
                {plan.visits > 0 && (
                  <div className="mb-6 flex items-center justify-center gap-2 bg-primary/5 rounded-xl py-2.5 px-4">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary">{plan.visits} زيارة</span>
                    <span className="text-xs text-muted-foreground">متضمنة في الباقة</span>
                  </div>
                )}

                <ul className="space-y-3 mb-8 min-h-[160px]">
                  {plan.features.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-xs text-muted-foreground text-center pt-2">
                      + {plan.features.length - 6} مميزات أخرى
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-green-600 font-medium bg-green-50 rounded-xl py-2">
                      أنت مشترك حالياً - {currentSubscription?.visits ?? 0} زيارة متبقية
                    </div>
                    <Button
                      variant="outline"
                      className="w-full py-6 text-lg border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => handleSubscribeClick(plan)}
                    >
                      تجديد الاشتراك
                    </Button>
                  </div>
                ) : (
                  <Button
                    className={`w-full py-6 text-lg ${plan.isFeatured ? 'btn-hero-primary' : 'btn-hero-secondary'}`}
                    onClick={() => handleSubscribeClick(plan)}
                  >
                    اشترك الآن
                  </Button>
                )}
              </div>
            );
          })}
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
                : 'أنت على وشك الاشتراك في الباقة التالية'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              {/* Warning if already subscribed */}
              {currentSubscription && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm">تنبيه: اشتراكك الحالي سينتهي</span>
                  </div>
                  <div className="text-sm text-red-600 space-y-1 pr-7">
                    <p>
                      باقتك الحالية: <span className="font-bold">{currentSubscription.planName}</span>
                    </p>
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

              {/* New plan details */}
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
                  <span className="font-bold text-primary text-lg">
                    {selectedPlan.priceAfterDiscount} ريال
                  </span>
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
    </section>
  );
};

export default PackagesSection;
