import { Wrench, Zap, Wind, Home, Sparkles, CalendarDays } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: 'صيانة السباكة',
    description: 'إصلاح التسريبات وصيانة الأنابيب والحنفيات',
    color: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'صيانة الكهرباء',
    description: 'تركيب وصيانة جميع الأعمال الكهربائية',
    color: 'bg-amber-50',
  },
  {
    icon: Wind,
    title: 'التكييف',
    description: 'صيانة وتنظيف وتركيب أجهزة التكييف',
    color: 'bg-cyan-50',
  },
  {
    icon: Home,
    title: 'الصيانة العامة',
    description: 'جميع أعمال الصيانة المنزلية الشاملة',
    color: 'bg-green-50',
  },
  {
    icon: Sparkles,
    title: 'التنظيف المنزلي',
    description: 'تنظيف شامل ومتكامل لمنزلك',
    color: 'bg-pink-50',
  },
  {
    icon: CalendarDays,
    title: 'باقات تنظيف سنوية',
    description: 'اشتراكات تنظيف دورية بأسعار مميزة',
    color: 'bg-purple-50',
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">خدماتنا</span>
          <h2 className="section-title">خدمات متنوعة تُلبي كل احتياجات بيتك</h2>
          <p className="section-subtitle">
            نوفر لك مجموعة متكاملة من الخدمات بجودة واحترافية عالية
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="card-service group cursor-pointer"
            >
              <div className={`icon-container-lg ${service.color} mb-5`}>
                <service.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground">{service.description}</p>
              
              <div className="mt-4 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>المزيد</span>
                <svg className="w-4 h-4 mr-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
