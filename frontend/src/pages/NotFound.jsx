import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import errorImg from "../assets/404_page.jpg";

const NotFound = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="h-[100dvh] w-screen bg-gradient-to-br from-[#f8faff] via-white to-[#f0f7ff] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans relative">
      {/* Dynamic Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-blue-100/40 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-emerald-50/40 rounded-full blur-[100px]" 
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1200px] w-full h-full max-h-[600px] sm:max-h-[750px] md:h-[80vh] md:max-h-[850px] bg-white/75 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_-30px_rgba(0,102,255,0.12)] flex flex-col md:flex-row overflow-hidden border border-white/60 relative z-10"
      >
        {/* Visual Panel (Top on mobile) */}
        <div className="h-[35%] md:h-full md:flex-1 relative bg-slate-50 order-1 md:order-2 shrink-0 overflow-hidden">
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="w-full h-full relative"
           >
              <motion.img 
                 animate={{ scale: [1, 1.02, 1] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                 src={errorImg}
                 alt="Healthcare support"
                 className="w-full h-full object-cover absolute inset-0"
                 style={{ objectPosition: "center 20%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none" />
           </motion.div>
        </div>

        {/* Content Panel (Left on desktop) */}
        <div className="flex-1 md:flex-[1.3] p-4 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center relative order-2 md:order-1 overflow-hidden min-h-0">
          
          <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6 overflow-hidden w-full flex-nowrap shrink-0">
            {/* The 404 Text - Scaled down for safe fit */}
            <h1 className="text-[3.5rem] sm:text-[4rem] lg:text-[6.5rem] xl:text-[8rem] font-black text-slate-800 leading-none select-none tracking-tighter shrink-0">4</h1>
            <div className="relative flex items-center justify-center shrink-0 w-auto">
              <h1 className="text-[3.5rem] sm:text-[4rem] lg:text-[6.5rem] xl:text-[8rem] font-black leading-none opacity-0 select-none">0</h1>
              {/* Perfectly round 0 with heartbeat - Moderate size */}
              <div className="absolute inset-[10%] rounded-full border-[6px] sm:border-[10px] md:border-[14px] border-slate-800 flex items-center justify-center bg-white shadow-inner overflow-hidden shadow-[0_0_40px_rgba(0,102,255,0.12)] ring-2 sm:ring-4 ring-white">
                   {/* Continuous Vital Animation */}
                   <div className="absolute inset-0 flex items-center w-[200%] h-full text-[#0066FF]">
                      <svg width="200%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" className="drop-shadow-[0_0_10px_rgba(0,102,255,0.6)]">
                         <motion.path
                           d="M 0 50 L 25 50 L 32 15 L 40 85 L 48 50 L 100 50 L 125 50 L 132 15 L 140 85 L 148 50 L 200 50"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="6"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           initial={{ x: 0 }}
                           animate={{ x: "-50%" }}
                           transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                         />
                      </svg>
                   </div>
                   <motion.div 
                     animate={{ opacity: [0.1, 0.4, 0.1] }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                     className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0066FF]/10 to-transparent"
                   />
              </div>
            </div>
            <h1 className="text-[3.5rem] sm:text-[4rem] lg:text-[6.5rem] xl:text-[8rem] font-black text-slate-800 leading-none select-none tracking-tighter shrink-0">4</h1>
          </motion.div>

          {/* Text Content */}
          <motion.div variants={itemVariants} className="space-y-2 md:space-y-4 max-w-[400px] text-center md:text-left shrink">
             <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Page Not Found</h2>
             <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-500 font-medium leading-relaxed">
               Oops! It seems you've wandered into an uncharted area. Our team is ready to guide you back.
             </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mt-6 md:mt-10 flex flex-wrap justify-center md:justify-start gap-3 md:gap-5 shrink-0">
             <motion.button 
               onClick={() => navigate(-1)}
               whileHover={{ scale: 1.05, y: -2, backgroundColor: "#f8fafc" }}
               whileTap={{ scale: 0.95 }}
               className="bg-white text-slate-700 border-2 border-slate-100 hover:border-slate-200 font-bold px-5 py-2.5 md:px-10 md:py-4 rounded-xl transition-all text-xs sm:text-sm md:text-base flex items-center justify-center gap-2.5 shadow-sm"
             >
               <motion.div animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                 <ArrowLeft size={20} strokeWidth={2.5} />
               </motion.div>
               Go Back
             </motion.button>
             
             <motion.button 
               onClick={() => navigate("/")}
               whileHover={{ scale: 1.05, y: -2, backgroundColor: "#0052cc", boxShadow: "0 15px 30px rgba(0,102,255,0.25)" }}
               whileTap={{ scale: 0.95 }}
               className="bg-[#0066FF] text-white font-bold px-5 py-2.5 md:px-10 md:py-4 rounded-xl transition-all text-xs sm:text-sm md:text-base flex items-center justify-center gap-2.5 shadow-xl"
             >
               <Home size={20} strokeWidth={2.5} /> Homepage
             </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
