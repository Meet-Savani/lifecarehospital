import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { ArrowRight, Activity, Ambulance, Microscope, Pill, BedSingle, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AnimatedSectionHeader, StaggerContainer, cardVariants, buttonHoverTap } from "./AnimatedSection";

const iconMap = {
  emergency: <Activity className="h-7 w-7" />,
  ambulance: <Ambulance className="h-7 w-7" />,
  lab: <Microscope className="h-7 w-7" />,
  pharmacy: <Pill className="h-7 w-7" />,
  room: <BedSingle className="h-7 w-7" />,
  Stethoscope: <Stethoscope className="h-7 w-7" />,
};

const fallbackServices = [
  { id: "1", title: "24x7 Emergency Care", description: "Lifecare Hospital offers 24x7 emergency care with specialized ICU support and neurosurgery backup.", icon: "emergency" },
  { id: "2", title: "Ambulance Services", description: "Reliable ambulance services, ensuring patients get timely care when every second counts.", icon: "ambulance" },
  { id: "3", title: "Home Sample Pickup", description: "Sample pickup at your home & give 99.8% accuracy in results.", icon: "lab" },
  { id: "4", title: "24/7 Pharmacy", description: "Medicines at your doorsteps. Shop your medicine online from LIOHN. Essentials at your doorstep anytime in emergency situation.", icon: "pharmacy" },
  { id: "5", title: "Private Rooms", description: "Private rooms are quieter and safer than shared rooms and better for your recovery. Every patient gets their own private room.", icon: "room" }
];

export default function ServicesSection() {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/services");
        return response.data && response.data.length > 0 ? response.data : fallbackServices;
      } catch (e) {
        return fallbackServices;
      }
    },
  });

  const items = services || fallbackServices;

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSectionHeader
          badge="What We Offer"
          title="Our Medical Services"
          description="We provide a wide range of medical specialties, each staffed by experienced professionals dedicated to your health."
        />

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.1}>
          {items.map((s, i) => (
            <motion.div 
              key={s.id || i}
              variants={cardVariants.fadeUp}
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.12)" }}
              className="p-8 rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 group"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300"
              >
                {iconMap[s.icon || "Stethoscope"] || <Stethoscope className="h-7 w-7" />}
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-foreground/60 mb-6 leading-relaxed text-sm">{s.description}</p>
              <motion.div {...buttonHoverTap} className="inline-block">
                <Link to={`/services/${s.id || s._id || i}`} className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
