import { Heart, Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const footerColumnVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-foreground border-t border-slate-200 mt-auto dark:bg-card dark:border-border">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-4 gap-8"
        >
          <motion.div custom={0} variants={footerColumnVariant}>
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="h-6 w-6" />
              </motion.div>
              <span className="text-lg font-bold">LIOHNS Hospital</span>
            </div>
            <p className="text-sm text-foreground/70">
              Providing quality healthcare services with compassion and excellence since 2010.
            </p>
          </motion.div>
          <motion.div custom={1} variants={footerColumnVariant}>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-foreground/70">
              <a href="/#about" className="block hover:text-primary hover:translate-x-1 transition-all duration-200">About Us</a>
              <a href="/#services" className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Services</a>
              <a href="/#doctors" className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Our Doctors</a>
              <a href="/#blog" className="block hover:text-primary hover:translate-x-1 transition-all duration-200">Health Blog</a>
            </div>
          </motion.div>
          <motion.div custom={2} variants={footerColumnVariant}>
            <h4 className="font-semibold mb-3">Services</h4>
            <div className="space-y-2 text-sm text-foreground/70">
              <p>General Medicine</p>
              <p>Cardiology</p>
              <p>Orthopedics</p>
              <p>Pediatrics</p>
            </div>
          </motion.div>
          <motion.div custom={3} variants={footerColumnVariant}>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-foreground/70">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 91043 23400</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> liohnshospital748@gmail.com</p>
              <p className="flex items-center gap-2"><MapPin className="h-8 w-8" /> Sarva Mangal Hall, Besides Swami Vivekananda Road Chowk, Memnagar, Ahmedabad, Gujarat 380052</p>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="border-t border-border mt-8 pt-6 text-center text-sm text-foreground/60 origin-center"
        >
          © {new Date().getFullYear()} LIOHNS Hospital. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
}
