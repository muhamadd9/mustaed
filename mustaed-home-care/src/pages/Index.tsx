import HeroSection from '@/components/HeroSection';
import WhyMustaed from '@/components/WhyMustaed';
import ServicesSection from '@/components/ServicesSection';
import PackagesSection from '@/components/PackagesSection';
import CoverageSection from '@/components/CoverageSection';
import HowItWorks from '@/components/HowItWorks';
import ContactSection from '@/components/ContactSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhyMustaed />
      <ServicesSection />
      <PackagesSection />
      <CoverageSection />
      <HowItWorks />
      <ContactSection />
    </div>
  );
};

export default Index;
