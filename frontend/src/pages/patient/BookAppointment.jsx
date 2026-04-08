import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  User, Calendar as CalendarIcon, Clock, 
  ChevronRight, Info, AlertCircle, CalendarX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  AlertDialog, AlertDialogAction, 
  AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

const convertTo24h = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const isTimeInRange = (slot, range) => {
  const slot24 = convertTo24h(slot);
  return slot24 >= range.start && slot24 <= range.end;
};

export default function BookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const { data: doctors } = useQuery({
    queryKey: ["doctors-for-booking"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const { data: slotData, refetch: refetchSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ["booked-slots", doctorId, date],
    queryFn: async () => {
      const response = await api.get(`/appointments/doctor/${doctorId}/booked-slots?date=${date}`);
      return response.data;
    },
    enabled: !!doctorId && !!date,
  });

  useEffect(() => {
    if (slotData?.isFullyBlocked) {
      setShowBlockedModal(true);
      setTime("");
    }
  }, [slotData, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !time) return;
    setLoading(true);
    try {
      await api.post("/appointments/appointments", {
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        notes,
      });
      toast({ title: "Appointment booked!", description: "You'll be notified once the doctor approves." });
      navigate("/patient/appointments");
    } catch (err) {
      toast({ title: "Failed to book", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors?.find((d) => d._id === doctorId);

  const getSlotStatus = (slot) => {
    if (slotData?.booked?.includes(slot)) return "booked";
    const isUnavailable = slotData?.unavailableRanges?.some(range => isTimeInRange(slot, range));
    if (isUnavailable) return "unavailable";
    return "available";
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-10 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-foreground tracking-tight"
          >
            Book <span className="text-primary italic">Consultation</span> ✨
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2">Secure your appointment with top-tier medical specialists.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Step 1: Select Doctor & Date */}
            <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-border flex flex-col md:flex-row gap-6 transition-colors duration-300">
              <div className="flex-1 space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Specialist</Label>
                <Select value={doctorId} onValueChange={(val) => { setDoctorId(val); setTime(""); }}>
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/20 focus:ring-primary/20 text-foreground">
                    <SelectValue placeholder="Choose your doctor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card">
                    {doctors?.map((d) => (
                      <SelectItem key={d._id} value={d._id} className="rounded-xl">
                        {d.userId?.fullName} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-64 space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Session Date</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => { setDate(e.target.value); setTime(""); }} 
                  required 
                  min={new Date().toISOString().split("T")[0]} 
                  className="h-14 rounded-2xl border-border bg-muted/20 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>

            {/* Step 2: Select Time Slot */}
            <AnimatePresence mode="wait">
              {doctorId && !slotData?.isFullyBlocked && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-card p-10 rounded-[3rem] shadow-xl border border-border transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                      <Clock className="w-6 h-6 text-primary" /> Select Time Slot
                    </h3>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Available</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-destructive rounded-full" /> Booked</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Busy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {timeSlots.map((t) => {
                      const status = getSlotStatus(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={status !== "available"}
                          onClick={() => setTime(t)}
                          className={cn(
                            "h-16 rounded-2xl font-black text-xs transition-all duration-300 border-2",
                            status === "available" && time === t ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : 
                            status === "available" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/40" :
                            status === "booked" ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-40" :
                            "bg-orange-500/10 text-orange-500 border-orange-500/20 cursor-not-allowed opacity-60"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fully Blocked Alert */}
            <AnimatePresence>
              {slotData?.isFullyBlocked && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 bg-orange-500/10 rounded-[3rem] border-2 border-dashed border-orange-500/20 text-center space-y-4"
                >
                  <CalendarX className="w-16 h-16 text-orange-400 mx-auto" />
                  <h3 className="text-xl font-black text-orange-500 uppercase tracking-tight">Physician Unavailable</h3>
                  <p className="text-orange-500/70 font-medium max-w-md mx-auto">
                    The doctor is currently unavailable on the selected date. Please choose an alternative date for your consultation.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Notes & Finalize */}
            {time && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 dark:bg-slate-900/50 p-10 rounded-[3rem] text-white border border-white/5 space-y-8"
              >
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Additional Notes</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Describe your symptoms or reason for visit..." 
                    className="bg-white/5 border-white/10 rounded-3xl min-h-[120px] focus:ring-primary/40 focus:border-primary/40 p-6 font-medium placeholder:text-white/20"
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-18 rounded-[2rem] bg-primary text-white hover:bg-white hover:text-slate-900 transition-all duration-500 font-black text-lg shadow-2xl shadow-primary/30"
                >
                  {loading ? "Synchronizing..." : "Confirm & Establish Booking"}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Right Sidebar: Doctor Overview */}
          <div className="lg:col-span-4 space-y-6">
            <AnimatePresence>
              {selectedDoctor ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-10 rounded-[3rem] border border-border shadow-xl sticky top-24 text-center transition-colors duration-300"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-primary/5 border-4 border-card shadow-xl overflow-hidden">
                      {selectedDoctor.profileImage ? (
                        <img src={selectedDoctor.profileImage} alt={selectedDoctor.userId?.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <User className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{selectedDoctor.userId?.fullName}</h3>
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mt-1">{selectedDoctor.specialization}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-[3rem] p-12 text-center text-muted-foreground">
                   <CalendarIcon className="w-8 h-8 opacity-20 mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Select Physician</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AlertDialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
         <AlertDialogContent className="rounded-[3rem] border-border bg-card p-10 shadow-2xl">
            <AlertDialogHeader className="items-center text-center">
               <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-orange-500" />
               </div>
               <AlertDialogTitle className="text-2xl font-black text-foreground tracking-tight">Physician Unavailable</AlertDialogTitle>
               <AlertDialogDescription className="text-muted-foreground font-medium text-base">
                  Doctor is unavailable on selected date. Please choose another date or another specialist.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8">
               <AlertDialogAction className="w-full h-14 rounded-2xl bg-primary hover:scale-[0.98] transition-transform text-white font-black uppercase text-xs tracking-widest border-none">
                  Acknowledged
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
