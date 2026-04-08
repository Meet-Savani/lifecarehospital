import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Briefcase, GraduationCap, FileText, 
  Edit3, Save, X, Activity, DollarSign, Calendar, 
  Trash2, Plus, Clock 
} from "lucide-react";

export default function DoctorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newUnavail, setNewUnavail] = useState({ date: "", time: "09:00 AM" });

  const { data: doctor, refetch } = useQuery({
    queryKey: ["doctor-me-profile", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    specialization: "",
    experience: 0,
    bio: "",
    consultationFee: 150,
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: user?.fullName || "",
        specialization: doctor?.specialization || "",
        experience: doctor?.experience || 0,
        bio: doctor?.bio || "",
        consultationFee: doctor?.consultationFee || 150,
      });
    }
  }, [doctor, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/doctors/${doctor._id}`, formData);
      await refetch();
      setIsEditing(false);
      toast({ title: "Profile Updated Successfully!" });
    } catch (err) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  const addUnavailability = async () => {
    if (!newUnavail.date || !newUnavail.time) return;
    try {
      const updatedSlots = [...(doctor.unavailableSlots || []), newUnavail];
      await api.put(`/appointments/doctors/${doctor._id}`, { unavailableSlots: updatedSlots });
      await refetch();
      setNewUnavail({ date: "", time: "09:00 AM" });
      toast({ title: "Slot Marked Unavailable" });
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  };

  const removeUnavailability = async (index) => {
    try {
      const updatedSlots = doctor.unavailableSlots.filter((_, i) => i !== index);
      await api.put(`/appointments/doctors/${doctor._id}`, { unavailableSlots: updatedSlots });
      await refetch();
      toast({ title: "Slot Made Available" });
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="h-48 bg-gradient-to-r from-slate-900 to-primary relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1),rgba(255,255,255,0))]" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
              <div className="relative">
                <Avatar className="w-40 h-40 border-8 border-white shadow-2xl">
                  <AvatarImage src={doctor?.profileImage || user?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                    {user?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-primary p-3 rounded-full shadow-lg border-4 border-white text-white hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-24 pb-12 px-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-2">{user?.fullName}</h1>
            <p className="text-primary font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
              <Activity className="w-5 h-5" /> {doctor?.specialization || "Clinical Excellence"}
            </p>

            <form onSubmit={handleUpdate} className="max-w-4xl mx-auto mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specialization</Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Years Experience</Label>
                  <Input
                    type="number"
                    disabled={!isEditing}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Consultation Fee ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="number"
                      disabled={!isEditing}
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-black pl-12 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Bio</Label>
                  <Textarea
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-3xl border-slate-100 bg-slate-50/50 min-h-[120px] resize-none font-medium p-6"
                    placeholder="Clinical expertise and patient care philosophy..."
                  />
                </div>
              </div>

              <div className="flex justify-center mt-12 gap-6">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="rounded-2xl px-12 h-14 gap-3 bg-slate-900 hover:bg-slate-800 text-white shadow-2xl font-black uppercase tracking-widest text-[11px]"
                  >
                    <Edit3 className="w-5 h-5" /> Edit Profile Settings
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="rounded-2xl px-12 h-14 gap-3 border-slate-200 text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      <X className="w-5 h-5" /> Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="rounded-2xl px-12 h-14 gap-3 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 text-white font-black uppercase tracking-widest text-[11px]"
                    >
                      <Save className="w-5 h-5" /> Update Record
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Unavailability Management */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm"
        >
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
             <div>
               <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                 <Clock className="w-10 h-10 text-orange-500" /> Manage Available Slots
               </h2>
               <p className="text-slate-500 font-medium mt-2">Block off time slots when you are unavailable for consultations.</p>
             </div>
             
             <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Date</Label>
                  <Input 
                    type="date" 
                    value={newUnavail.date} 
                    onChange={(e) => setNewUnavail({...newUnavail, date: e.target.value})} 
                    className="h-12 rounded-xl bg-white border-slate-100 min-w-[180px]"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Time Slot</Label>
                  <Select value={newUnavail.time} onValueChange={(v) => setNewUnavail({...newUnavail, time: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 min-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addUnavailability} className="h-12 rounded-xl px-6 bg-orange-500 hover:bg-orange-600 font-black uppercase text-[10px] tracking-widest">
                  <Plus className="w-4 h-4 mr-2" /> Block Slot
                </Button>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {doctor?.unavailableSlots?.length === 0 ? (
               <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-bold text-slate-400 tracking-tight">No unavailability records found.</p>
               </div>
             ) : (
                <AnimatePresence>
                  {doctor?.unavailableSlots.map((slot, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Unavailable</p>
                        <p className="font-black text-slate-800">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs font-bold text-slate-500">{slot.time}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeUnavailability(i)}
                        className="rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
             )}
           </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
