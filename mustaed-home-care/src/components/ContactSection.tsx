import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactSection = () => {
  const contacts = [
    {
      icon: MessageCircle,
      label: 'واتساب (الطريقة المفضلة)',
      value: '+966 56 386 6234',
      href: 'https://wa.me/966563866234',
      primary: true,
    },
    {
      icon: Mail,
      label: 'البريد الإلكتروني',
      value: 'services@mostaed.com',
      href: 'mailto:services@mostaed.com',
      primary: false,
    },
    {
      icon: Mail,
      label: 'البريد الإلكتروني البديل',
      value: 'mustaed.app@gmail.com',
      href: 'mailto:mustaed.app@gmail.com',
      primary: false,
    },
    {
      icon: MapPin,
      label: 'الموقع',
      value: 'الرياض، المملكة العربية السعودية',
      href: '#',
      primary: false,
    },
  ];

  return (
    <section id="contact" className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">تواصل معنا</span>
          <h2 className="section-title">نحن هنا لخدمتك</h2>
          <p className="section-subtitle">
            تواصل معنا عبر أي من الطرق التالية وسنرد عليك في أقرب وقت
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-4 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                  contact.primary
                    ? 'gradient-bg text-white shadow-lg hover:shadow-xl'
                    : 'bg-card shadow-sm hover:shadow-md border border-border/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  contact.primary ? 'bg-white/20' : 'bg-primary/10'
                }`}>
                  <contact.icon className={`w-7 h-7 ${contact.primary ? 'text-white' : 'text-primary'}`} />
                </div>
                <div>
                  <div className={`text-sm ${contact.primary ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {contact.label}
                  </div>
                  <div className={`font-bold text-lg ${contact.primary ? 'text-white' : 'text-foreground'}`}>
                    {contact.value}
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              asChild
              className="btn-hero-primary text-lg px-12"
            >
              <a href="https://wa.me/966563866234" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 ml-2" />
                تواصل عبر واتساب
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
