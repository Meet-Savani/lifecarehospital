import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Pill, Calendar, User as UserIcon, 
  Download, FileText, Activity, Clock,
  ArrowRight, Search, Info, CheckCircle2,
  UtensilsCrossed
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["my-prescriptions", user?._id],
    queryFn: async () => {
      const response = await api.get("/prescriptions");
      return response.data || [];
    },
    enabled: !!user,
  });

  const filteredPrescriptions = prescriptions?.filter(p => 
    p.doctorId?.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.medicines.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout role="patient">
      <div className="space-y-10 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-slate-900 tracking-tight"
            >
              Health <span className="text-secondary italic">Prescriptions</span> ⚕️
            </motion.h1>
            <p className="text-slate-500 font-medium mt-2">Access your medical instructions and pharmaceutical history.</p>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Search medicine or doctor..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-secondary/20"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {isLoading ? (
             Array(4).fill(0).map((_, i) => (
               <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[3rem]" />
             ))
           ) : filteredPrescriptions?.length === 0 ? (
             <div className="lg:col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Pill className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400">No prescriptions found.</p>
             </div>
           ) : (
             filteredPrescriptions.map((presc, i) => (
               <motion.div
                 key={presc._id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group"
               >
                 <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary font-black border border-secondary/10">
                             <Pill className="w-7 h-7" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Pharmacopeia Record</p>
                             <p className="font-black text-slate-900 text-lg uppercase tracking-tight">ID: {presc._id.slice(-6)}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Issued Date</p>
                          <p className="font-black text-slate-900 mt-1">{new Date(presc.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       {presc.medicines.map((med, idx) => (
                          <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 group-hover:bg-white transition-colors duration-300">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                      <Activity className="w-5 h-5 text-emerald-500" />
                                   </div>
                                   <p className="font-black text-slate-800 text-base">{med.name}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                                   <UtensilsCrossed className="w-3 h-3 text-emerald-600" />
                                   <span className="text-[10px] font-black uppercase text-emerald-600">{med.mealTiming}</span>
                                </div>
                             </div>

                             <div className="flex flex-wrap gap-3">
                                {med.dosage?.morning && (
                                   <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                      <Clock className="w-3 h-3" /> Morning
                                   </span>
                                )}
                                {med.dosage?.noon && (
                                   <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                      <Clock className="w-3 h-3" /> Noon
                                   </span>
                                )}
                                {med.dosage?.evening && (
                                   <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                      <Clock className="w-3 h-3" /> Evening
                                   </span>
                                )}
                             </div>

                             {med.description && (
                                <p className="text-[11px] text-slate-500 font-medium pl-1 border-l-2 border-slate-200">
                                   {med.description}
                                </p>
                             )}
                          </div>
                       ))}
                    </div>

                    {presc.generalNotes && (
                       <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                             <Info className="w-4 h-4 text-secondary" /> Physician Observations
                          </p>
                          <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                             "{presc.generalNotes}"
                          </p>
                       </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                             {presc.doctorId?.userId?.fullName?.charAt(0)}
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-slate-400">Attending Doctor</p>
                             <p className="text-xs font-bold text-slate-800">Dr. {presc.doctorId?.userId?.fullName}</p>
                          </div>
                       </div>
                       <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest gap-3">
                          <Download className="w-4 h-4" /> Export PDF
                       </Button>
                    </div>
                 </div>
               </motion.div>
             ))
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
