import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollHeroSection from '@/components/home/ScrollHeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HowItWorks from '@/components/home/HowItWorks';
import MaterialsShowcase from '@/components/home/MaterialsShowcase';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ScrollHeroSection />
        <HowItWorks />
        <FeaturedProducts />
        <MaterialsShowcase />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;