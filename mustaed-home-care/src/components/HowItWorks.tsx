import { UserPlus, CreditCard, Package, CalendarCheck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'إنشاء حساب',
    description: 'سجّل حسابك بسهولة عبر رقم الجوال',
  },
  {
    icon: Package,
    title: 'اختيار الباقة',
    description: 'اختر الباقة المناسبة لاحتياجاتك',
  },
  {
    icon: CreditCard,
    title: 'الدفع',
    description: 'ادفع بأمان عبر طرق الدفع المتعددة',
  },
  {
    icon: CalendarCheck,
    title: 'الحجز',
    description: 'احجز موعد الخدمة المناسب لك',
  },
  {
    icon: CheckCircle,
    title: 'تنفيذ الخدمة',
    description: 'يصلك الفني المعتمد في الموعد المحدد',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding gradient-soft-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">كيف نعمل</span>
          <h2 className="section-title">خطوات بسيطة للبدء</h2>
          <p className="section-subtitle">
            احصل على خدماتنا بخطوات سهلة وسريعة
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full bg-card shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-shadow border-4 border-background">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-bg text-white font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
