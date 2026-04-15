import { Wifi, ShieldCheck, Microscope, Ambulance, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer } from "./AnimatedSection";

const facilities = [
  { icon: <Microscope className="h-7 w-7" />, title: "Advanced Lab", desc: "State-of-the-art diagnostic laboratory with 24/7 report delivery.", color: "blue" },
  { icon: <Ambulance className="h-7 w-7" />, title: "Emergency Care", desc: "Fully equipped mobile ICUs and rapid response trauma services.", color: "rose" },
  { icon: <ShieldCheck className="h-7 w-7" />, title: "Modern ICU", desc: "Specialized intensive care units with individual patient monitoring.", color: "emerald" },
  { icon: <Wifi className="h-7 w-7" />, title: "Digital Health", desc: "Paperless health records and online consultation infrastructure.", color: "amber" },
];

const alternateSlide = {
  hidden: (i) => ({
    opacity: 0,
    x: i % 2 === 0 ? -50 : 50,
    y: 20,
  }),
  visible: (i) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

export default function FacilitiesSection() {
  return (
    <section className="py-24 bg-card text-foreground transition-colors duration-300 overflow-hidden relative border-y border-border">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-6"
        >
          <div className="max-w-2xl text-left">
            <motion.div
              variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
              className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm mb-4"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span>World-Class Infrastructure</span>
            </motion.div>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="text-4xl md:text-5xl font-display font-black mb-4 italic text-foreground"
            >
              Equipped for Excellence
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="text-foreground/70 text-lg leading-relaxed font-medium"
            >
              Our hospital is equipped with the latest medical technology and 
              infrastructure to provide the best possible care for our patients.
            </motion.p>
          </div>
          <div className="hidden lg:block">
             <motion.div
               variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { duration: 0.4 } } }}
               className="h-16 w-[1px] bg-white/20 mx-auto origin-bottom"
             />
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((f, i) => (
            <motion.div 
              key={f.title}
              custom={i}
              variants={alternateSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
              className="p-8 rounded-[2.5rem] bg-background border border-border shadow-sm transition-all duration-500 group"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 15 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300 text-primary group-hover:text-white"
              >
                {f.icon}
              </motion.div>
              <h3 className="text-xl font-black mb-3 text-foreground">{f.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
