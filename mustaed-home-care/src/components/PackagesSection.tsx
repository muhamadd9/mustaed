import { useEffect, useState } from 'react';
import { Check, Star, Sparkles, Loader2, ClipboardList, AlertTriangle, ShieldCheck, Crown, Zap, ArrowLeft } from 'lucide-react';
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

  if (isLoading) {
    return (
      <section id="packages" className="section-padding gradient-soft-bg">
        <div className="container mx-auto px-4 flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">جاري تحميل الباقات...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!plans.length) {
    return null;
  }

  return (
    <section id="packages" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-soft-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: 'var(--gradient-primary)' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full mb-5 text-sm font-bold border border-primary/20">
            <Star className="w-4 h-4 fill-primary" />
            باقات الاشتراك
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            اختر الباقة{' '}
            <span className="gradient-text">المناسبة لك</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            باقات متنوعة تناسب جميع الاحتياجات، بأسعار شفافة وبدون رسوم مخفية
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.isFeatured ? Crown : planIcons[index % planIcons.length];
            const isCurrent = isCurrentPlan(plan._id);

            return (
              <div
                key={plan._id}
                className={`relative rounded-3xl transition-all duration-500 group ${plan.isFeatured
                    ? 'shadow-2xl scale-[1.03] ring-2 ring-primary'
                    : 'shadow-lg hover:shadow-2xl hover:-translate-y-2 ring-1 ring-border/50'
                  } ${isCurrent ? 'ring-2 ring-green-400 shadow-green-100 shadow-xl' : ''}`}
              >
                {/* Featured glow */}
                {plan.isFeatured && (
                  <div className="absolute -inset-px rounded-3xl opacity-30 blur-sm pointer-events-none" style={{ background: 'var(--gradient-primary)' }} />
                )}

                {/* Tag */}
                {(plan.isFeatured || plan.tag) && (
                  <div
                    className="absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl z-10"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
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

                <div className="bg-card rounded-3xl p-7 h-full flex flex-col overflow-hidden relative">
                  {/* Subtle inner glow for featured */}
                  {plan.isFeatured && (
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-2xl pointer-events-none" style={{ background: 'var(--gradient-primary)' }} />
                  )}

                  {/* Icon + Plan Name */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${plan.isFeatured ? 'text-white shadow-lg' : 'bg-primary/10'
                        }`}
                      style={plan.isFeatured ? { background: 'var(--gradient-primary)' } : {}}
                    >
                      <IconComponent className={`w-7 h-7 ${plan.isFeatured ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      {plan.subtitle && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{plan.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5 pb-5 border-b border-border/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-extrabold text-primary">{plan.priceAfterDiscount}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-muted-foreground">ريال</span>
                        <span className="text-xs text-muted-foreground">
                          / {plan.billingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}
                        </span>
                      </div>
                    </div>
                    {plan.price !== plan.priceAfterDiscount && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm line-through text-muted-foreground">{plan.price} ريال</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          وفّر {Math.round(((plan.price - plan.priceAfterDiscount) / plan.price) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Visits Count */}
                  {plan.visits > 0 && (
                    <div className="mb-5 flex items-center justify-center gap-2 bg-primary/5 rounded-xl py-3 px-4 border border-primary/15">
                      <ClipboardList className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-bold text-primary">{plan.visits} زيارة</span>
                      <span className="text-xs text-muted-foreground">متضمنة في الباقة</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.isFeatured ? 'bg-primary/20' : 'bg-primary/10'
                          }`}>
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/85 leading-snug">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-xs text-primary font-semibold text-center pt-1.5">
                        + {plan.features.length - 6} مميزات إضافية
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
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
                          ? 'text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
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

        {/* View All Plans CTA */}
        <div className="text-center mt-14">
          <p className="text-muted-foreground mb-4 text-sm">تريد مقارنة جميع الباقات بالتفصيل؟</p>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white gap-2 px-8 py-5 text-base font-bold rounded-xl transition-all duration-300"
            onClick={() => navigate('/plans')}
          >
            <ArrowLeft className="w-5 h-5" />
            عرض جميع الباقات
          </Button>
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
    </section>
  );
};

export default PackagesSection;
