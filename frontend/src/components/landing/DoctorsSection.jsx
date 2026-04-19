import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AnimatedSectionHeader, StaggerContainer, cardVariants, buttonHoverTap } from "./AnimatedSection";

const fallbackDoctors = [
    { _id: "1", userId: { fullName: "Dr. Navin Patel" }, specialization: "Consulting ENT Surgeon", experience: 15, profileImage: "" },
    { _id: "2", userId: { fullName: "Dr. Rajan Merai" }, specialization: "ENT Surgeon. DLO(ENT)", experience: 12, profileImage: "" },
    { _id: "3", userId: { fullName: "Dr. Heer Patel" }, specialization: "MS (ENT), FOIOSAS", experience: 10, profileImage: "" },
    { _id: "4", userId: { fullName: "Dr. Kanak Mittal Patel" }, specialization: "ENT Consultant", experience: 8, profileImage: "" },
    { _id: "5", userId: { fullName: "Dr. Abhijit Makwana" }, specialization: "Head & Neck Cancer Surgeon", experience: 10, profileImage: "" }
];

export default function DoctorsSection() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data: doctors } = useQuery({
    queryKey: ["doctors-public"],
    queryFn: async () => {
      try {
        const response = await api.get("/appointments/doctors");
        return response.data && response.data.length > 0 ? response.data : fallbackDoctors;
      } catch (e) {
        return fallbackDoctors;
      }
    },
  });

  const items = doctors || fallbackDoctors;

  return (
    <section id="doctors" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <AnimatedSectionHeader
          badge="Expert Team"
          title="Meet Our Specialists"
          description="Our doctors are leaders in their fields, committed to providing personalized and compassionate care to every patient."
        />
        
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" stagger={0.12}>
          {items.slice(0, 8).map((d, i) => (
            <motion.div 
              key={d._id || i}
              variants={cardVariants.fadeUp}
              whileHover={{ y: -10, rotateY: 3, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group relative bg-card rounded-2xl shadow-sm overflow-hidden border border-border flex flex-col h-full"
              style={{ perspective: "800px" }}
            >
              <div className="relative h-64 overflow-hidden">
                {d.profileImage ? (
                  <img 
                    src={d.profileImage} 
                    alt={d.userId?.fullName} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User className="h-20 w-20 text-foreground/30" />
                  </div>
                )}
                {(!role || (role !== "doctor" && role !== "admin")) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <motion.div {...buttonHoverTap} className="w-full">
                      <Button 
                        onClick={() => navigate(`/patient/book?doctor_id=${d._id}`)}
                        variant="secondary" 
                        className="w-full bg-background/90 backdrop-blur-sm border-none text-foreground hover:bg-background"
                      >
                        Book Appointment
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
              
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {d.userId?.fullName || "Specialist Doctor"}
                </h3>
                <p className="text-primary font-medium text-sm mt-1">{d.specialization}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-foreground/60">
                  <span className="text-xs font-semibold uppercase tracking-wider">{d.experience}+ Years Experience</span>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
        
        {items.length >= 8 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <motion.div {...buttonHoverTap} className="inline-block">
              <Button 
                onClick={() => navigate("/doctors")}
                variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-white transition-all duration-300 border-primary text-primary"
              >
                View All Specialist
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
