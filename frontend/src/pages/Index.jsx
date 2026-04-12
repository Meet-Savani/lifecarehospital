import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import DoctorsSection from "@/components/landing/DoctorsSection";
import FacilitiesSection from "@/components/landing/FacilitiesSection";
import FAQSection from "@/components/landing/FAQSection";
import BlogSection from "@/components/landing/BlogSection";
import ContactSection from "@/components/landing/ContactSection";
import DoctorQuickAccess from "@/components/landing/DoctorQuickAccess";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { role } = useAuth();
  const isDoctor = role === "doctor";
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection id="hero" />
      
      {isDoctor && <DoctorQuickAccess />}
      
      <AboutSection />
      <ServicesSection />
      <DoctorsSection />
      <FacilitiesSection />
      <BlogSection />
      
      {!isDoctor && (
        <>
          <FAQSection />
          <ContactSection />
        </>
      )}
      
      <Footer />
    </div>
  );
}
