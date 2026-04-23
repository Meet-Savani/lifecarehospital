import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Heart } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/Logo.png"

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";
  const { pathname } = useLocation();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setOpen(false);

    const scrollToSection = () => {
      if (targetId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          const yOffset = -80; // Compensating for navbar height
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    };

    if (pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 100);
    } else {
      scrollToSection();
    }
  };

  const navLinks = [
    { label: "Home", id: "hero", href: "/" },
    { label: "About", id: "about", href: "/#about" },
    { label: "Services", id: "services", href: "/#services" },
    { label: "Doctors", id: "doctors", href: "/#doctors" },
    { label: "Blog", id: "blog", href: "/#blog" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <a href="/" onClick={(e) => handleNavClick(e, "hero")} title="Home" className="flex items-center gap-2 group cursor-pointer">
          <img src={Logo} alt="LIOHNS Logo" className="h-7 md:h-9 lg:h-11 max-h-11 w-auto shadow-sm dark:invert group-hover:scale-105 transition-transform duration-300" />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          {role !== "doctor" && (
            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              Contact
            </a>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-4"
        >
          <ThemeToggle />
          <div className="h-8 w-[1px] bg-border mx-2" />
          {user ? (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" variant="ghost" className="rounded-full text-foreground/70 hover:text-foreground" onClick={signOut}>
                  Logout
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" variant="ghost" className="rounded-full font-semibold text-foreground/70 hover:text-foreground" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="rounded-full px-6 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => navigate("/register")}>
                  Get Started
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-secondary text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      </motion.nav>

      <AnimatePresence>
        {open && (
           <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 w-full bg-background shadow-2xl z-[70] overflow-hidden flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border shadow-sm">
                <img src={Logo} alt="Logo" className="h-8 w-auto dark:invert" />
                <button
                  className="p-2 rounded-lg bg-secondary/20 text-foreground hover:bg-secondary/40 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                className="px-4 py-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar"
              >
                <div className="grid grid-cols-1 gap-4">
                  {navLinks.map((link) => (
                    <motion.a
                      key={link.id}
                      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.id)}
                      className="group relative block w-full px-4 py-4 rounded-xl overflow-hidden bg-muted/50 border border-border text-base font-semibold text-foreground transition-all duration-300 shadow-sm active:scale-95 hover:text-white hover:shadow-md hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                      <span className="relative z-10 flex items-center gap-2">{link.label}</span>
                    </motion.a>
                  ))}
                  {role !== "doctor" && (
                    <motion.a
                      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                      href="/#contact"
                      onClick={(e) => handleNavClick(e, "contact")}
                      className="group relative block w-full px-4 py-4 rounded-xl overflow-hidden bg-muted/50 border border-border text-base font-semibold text-foreground transition-all duration-300 shadow-sm active:scale-95 hover:text-white hover:shadow-md hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                      <span className="relative z-10 flex items-center gap-2">Contact</span>
                    </motion.a>
                  )}
                </div>
                <div className="pt-6 mt-6 border-t border-border flex flex-col gap-4">
                  {user ? (
                    <>
                      <Button className="w-full h-14 rounded-xl text-lg font-bold shadow-md shadow-primary/20" onClick={() => { navigate(dashboardPath); setOpen(false); }}>Dashboard</Button>
                      <Button variant="outline" className="w-full h-14 rounded-xl text-lg font-bold border-2" onClick={signOut}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full h-14 rounded-xl text-lg font-bold shadow-md shadow-primary/20" onClick={() => { navigate("/register"); setOpen(false); }}>Register</Button>
                      <Button variant="outline" className="w-full h-14 rounded-xl text-lg font-bold border-2" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
