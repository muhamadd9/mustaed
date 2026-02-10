import { Mail, Phone, MapPin, Instagram, Twitter } from 'lucide-react';
import logo from '@/assets/mustaed-logo.png';

const Footer = () => {
  const quickLinks = [
    { label: 'الرئيسية', href: '#' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'الباقات', href: '#packages' },
    { label: 'نطاق التغطية', href: '#coverage' },
    { label: 'تواصل معنا', href: '#contact' },
  ];

  const services = [
    'صيانة السباكة',
    'صيانة الكهرباء',
    'التكييف',
    'الصيانة العامة',
    'التنظيف المنزلي',
  ];

  return (
    <footer className="bg-foreground text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <img src={logo} alt="مستعد" className="h-16 w-auto mb-4 brightness-200" />
            <p className="text-white/70 mb-6 leading-relaxed">
              مستعد هو منصتك الموثوقة لخدمات الصيانة والتنظيف المنزلي في الرياض. اشترك الآن واستمتع براحة البال.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">خدماتنا</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-white/70">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/50">واتساب</div>
                  <a href="https://wa.me/966563866234" className="hover:text-primary transition-colors">
                    +966 56 386 6234
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/50">البريد الإلكتروني</div>
                  <a href="mailto:services@mostaed.com" className="hover:text-primary transition-colors">
                    services@mostaed.com
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/50">الموقع</div>
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} مستعد. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
