import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, User as UserIcon, Calendar, 
  Search, Pill, History, ChevronRight,
  TrendingUp, Activity, Briefcase, Clock,
  UtensilsCrossed
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";

export default function PatientHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: doctor } = useQuery({
    queryKey: ["doctor-self-history", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: appointments } = useQuery({
    queryKey: ["doctor-patient-history", doctor?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!doctor,
  });

  // Get unique list of patients seen by this doctor
  const patientsSeen = Array.from(new Set(appointments?.map(a => a.patientId?._id)))
    .map(id => {
      const appt = appointments?.find(a => a.patientId?._id === id);
      return appt?.patientId;
    })
    .filter(p => p && p.fullName.toLowerCase().includes(search.toLowerCase()));

  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", selectedPatient?._id],
    queryFn: async () => {
      const response = await api.get(`/prescriptions/patient/${selectedPatient._id}`);
      return response.data || [];
    },
    enabled: !!selectedPatient,
  });

  const patientAppts = appointments?.filter(a => a.patientId?._id === selectedPatient?._id) || [];

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-slate-900 tracking-tight"
            >
              Patient <span className="text-primary italic">Archives</span> 📚
            </motion.h1>
            <p className="text-slate-500 font-medium mt-2">Comprehensive medical history and treatment logs.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search patients by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-slate-100 bg-white w-full md:w-80 shadow-sm focus:ring-primary/20"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patientsSeen.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <UserIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <p className="font-bold text-slate-400">No patient records found.</p>
            </div>
          ) : (
            patientsSeen.map((patient, i) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-2xl group-hover:scale-110 transition-transform duration-500">
                        {patient.fullName.charAt(0)}
                      </div>
                      <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Patient
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 truncate">{patient.fullName}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{patient.email}</p>
                    
                    <div className="mt-8 flex items-center justify-between text-slate-500 text-xs font-bold">
                       <span className="flex items-center gap-2">
                          <History className="w-4 h-4 text-primary" /> 
                          {appointments?.filter(a => a.patientId?._id === patient._id).length} Sessions
                       </span>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
           <DialogContent className="max-w-5xl rounded-[3.5rem] border-none p-0 overflow-hidden bg-slate-50 max-h-[90vh]">
              <div className="h-40 bg-slate-900 p-10 flex items-end justify-between relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                 <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white">{selectedPatient?.fullName}</h2>
                    <p className="text-white/60 font-medium text-sm mt-1">Medical Dossier & Historical Analytics</p>
                 </div>
                 <div className="relative z-10 flex gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm text-center min-w-[80px]">
                       <p className="text-[10px] font-black uppercase text-white/40">Status</p>
                       <p className="text-lg font-black text-emerald-400">Active</p>
                    </div>
                 </div>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto">
                 {/* Appointment History */}
                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                       <Calendar className="w-5 h-5 text-primary" /> Appointment Logs
                    </h4>
                    <div className="space-y-4">
                       {patientAppts.length === 0 ? (
                         <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">No historical logs found.</div>
                       ) : (
                         patientAppts.map((appt, i) => (
                           <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all duration-300">
                              <div>
                                 <p className="font-black text-slate-800">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{appt.time}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                appt.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                                appt.status === 'approved' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'
                              }`}>
                                 {appt.status}
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>

                 {/* Prescription History */}
                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                       <Pill className="w-5 h-5 text-secondary" /> Issued Prescriptions
                    </h4>
                    <div className="space-y-4">
                       {prescriptions?.length === 0 ? (
                         <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">No pharmaceutical records issued.</div>
                       ) : (
                         prescriptions?.map((presc, i) => (
                           <div key={i} className="p-8 bg-white rounded-[2rem] border border-slate-100 space-y-6 hover:shadow-lg transition-all">
                              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{new Date(presc.createdAt).toLocaleDateString()}</p>
                                 <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-secondary" />
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 {presc.medicines.map((m, idx) => (
                                    <div key={idx} className="space-y-2">
                                       <div className="flex items-center justify-between">
                                          <span className="font-black text-slate-800 text-sm">{m.name}</span>
                                          <div className="flex gap-1">
                                             {m.dosage?.morning && <span className="w-2 h-2 rounded-full bg-blue-400" title="Morning" />}
                                             {m.dosage?.noon && <span className="w-2 h-2 rounded-full bg-orange-400" title="Noon" />}
                                             {m.dosage?.evening && <span className="w-2 h-2 rounded-full bg-indigo-400" title="Evening" />}
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                             <UtensilsCrossed className="w-3 h-3" /> {m.mealTiming}
                                          </span>
                                       </div>
                                       {m.description && <p className="text-[10px] text-slate-500 italic">"{m.description}"</p>}
                                    </div>
                                 ))}
                              </div>
                              {presc.generalNotes && (
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Doctor Advice</p>
                                   <p className="text-[11px] text-slate-600 font-medium italic">"{presc.generalNotes}"</p>
                                </div>
                              )}
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
