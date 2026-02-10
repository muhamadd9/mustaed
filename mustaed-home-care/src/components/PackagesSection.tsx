import { useEffect, useState } from 'react';
import { Check, Star, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan, planService } from '@/services/plan.service';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PackagesSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await planService.getAllPlans();
        // API returns { success: true, data: { plans: [...] } }
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

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast.info('يرجى تسجيل الدخول أولاً للاشتراك', { position: 'top-center' });
      navigate('/login');
    } else {
      // Proceed to subscription (e.g., checkout page)
      // For now we can toast
      toast.success('سيتم تحويلك لصفحة الدفع قريباً');
    }
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

  // Fallback if no plans
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

            return (
              <div
                key={plan._id}
                className={plan.isFeatured ? 'card-package-featured scale-105' : 'card-package'}
              >
                {(plan.isFeatured || plan.tag) && (
                  <div className="absolute top-0 right-0 gradient-bg text-white text-sm font-bold px-4 py-1 rounded-bl-2xl rounded-tr-3xl">
                    {plan.tag || 'الأكثر طلباً'}
                  </div>
                )}

                <div className={`icon-container mb-6 ${plan.isFeatured ? 'bg-primary/20' : ''}`}>
                  <Icon className={`w-8 h-8 ${plan.isFeatured ? 'text-primary' : 'text-primary'}`} />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6 h-12 overflow-hidden">{plan.subtitle}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">{plan.priceAfterDiscount}</span>
                  <span className="text-muted-foreground mr-2">
                    ريال / {plan.billingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}
                  </span>
                </div>

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

                <Button
                  className={`w-full py-6 text-lg ${plan.isFeatured ? 'btn-hero-primary' : 'btn-hero-secondary'}`}
                  onClick={() => handleSubscribe(plan._id)}
                >
                  اشترك الآن
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
