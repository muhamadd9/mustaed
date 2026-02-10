import { Calendar, UserCheck, Zap, MessageCircle, MapPin } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'اشتراك سنوي ثابت',
    description: 'وفّر أكثر مع اشتراك سنوي بأسعار ثابتة ومعقولة',
  },
  {
    icon: UserCheck,
    title: 'فنيين معتمدين',
    description: 'فريق من الفنيين المحترفين والمعتمدين لخدمتك',
  },
  {
    icon: Zap,
    title: 'حجز سريع',
    description: 'احجز خدمتك بسهولة وسرعة عبر التطبيق أو الواتساب',
  },
  {
    icon: MessageCircle,
    title: 'دعم عبر واتساب',
    description: 'تواصل معنا مباشرة عبر واتساب للحصول على المساعدة',
  },
  {
    icon: MapPin,
    title: 'تغطية أحياء الرياض',
    description: 'نغطي جميع أحياء الرياض بخدماتنا المتميزة',
  },
];

const WhyMustaed = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">لماذا مستعد؟</span>
          <h2 className="section-title">مميزات تجعلنا الخيار الأفضل</h2>
          <p className="section-subtitle">
            نقدم لك تجربة فريدة في خدمات الصيانة والتنظيف المنزلي
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-feature group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="icon-container group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMustaed;
