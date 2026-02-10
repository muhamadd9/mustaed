import { ArrowLeft, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-technician.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decorations */}
      <div className="blob-decoration w-[500px] h-[500px] -top-40 -right-40" />
      <div className="blob-decoration w-[400px] h-[400px] bottom-20 -left-40 opacity-10" />
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">خدمات موثوقة ومعتمدة</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              مستعد…{' '}
              <span className="gradient-text">راحة بالك</span>
              <br />
              في صيانة وتنظيف منزلك
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              اشتراك سنوي ذكي يشمل الصيانة، التنظيف، والكهرباء – بدون تعب
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button className="btn-hero-primary group">
                اشترك الآن
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="btn-hero-secondary">
                تعرّف على الباقات
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center p-4 rounded-2xl bg-card shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">+500</div>
                <div className="text-sm text-muted-foreground">عميل سعيد</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">+50</div>
                <div className="text-sm text-muted-foreground">فني معتمد</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">دعم فني</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 gradient-bg rounded-[2.5rem] transform rotate-3 opacity-20" />
              <img
                src={heroImage}
                alt="فني صيانة مستعد"
                className="relative rounded-[2rem] shadow-2xl w-full object-cover aspect-[4/3]"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">ضمان الجودة</div>
                    <div className="text-sm text-muted-foreground">خدمة مضمونة 100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
