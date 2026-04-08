import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Calendar, UserRound, 
  Edit3, Save, X, Activity, CheckCircle2, AlertCircle 
} from "lucide-react";
import api from "@/services/api";

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || "",
      });
    }
  }, [user]);

  const validate = () => {
    if (formData.fullName.length < 3) {
      toast({ title: "Validation Error", description: "Full name must be at least 3 characters.", variant: "destructive" });
      return false;
    }
    if (formData.phone && !/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
      toast({ title: "Validation Error", description: "Please enter a valid phone number.", variant: "destructive" });
      return false;
    }
    if (formData.age && (formData.age < 0 || formData.age > 120)) {
      toast({ title: "Validation Error", description: "Please enter a valid age (0-120).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Send exactly what backend expects: fullName, phone, age
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        age: Number(formData.age)
      };
      
      const res = await api.put("/auth/profile", payload);
      
      // Update global context
      setUser({ ...user, ...res.data });
      setIsEditing(false);
      
      toast({ 
        title: "Profile Synchronized!", 
        description: "Your health records have been updated successfully.",
        variant: "default",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900"
      });
    } catch (err) {
      toast({ 
        title: "Update Blocked", 
        description: err.response?.data?.message || err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-slate-50 overflow-hidden"
        >
          {/* Cover & Avatar */}
          <div className="h-48 bg-slate-900 relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute -bottom-20 left-10 flex items-end gap-8">
              <div className="relative group">
                <Avatar className="w-44 h-44 border-[10px] border-white shadow-2xl rounded-[3rem]">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black rounded-[3rem]">
                    {user?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/40 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                     <Edit3 className="w-8 h-8" />
                  </button>
                )}
              </div>
              <div className="pb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{user?.fullName}</h1>
                <p className="text-slate-400 font-bold flex items-center gap-2 mt-1">
                  <UserRound className="w-4 h-4 text-primary" /> Healthcare Recipient
                </p>
              </div>
            </div>
          </div>

          <div className="pt-32 pb-16 px-12">
            <div className="flex items-center justify-between mb-12 border-b border-slate-50 pb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                   <p className="text-slate-400 font-medium text-sm">Review and update your biometric and contact details.</p>
                </div>
                {!isEditing && (
                   <Button 
                     onClick={() => setIsEditing(true)}
                     className="rounded-2xl px-8 h-12 gap-2 bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200 font-black uppercase tracking-widest text-[10px]"
                   >
                     <Edit3 className="w-4 h-4" /> Edit Profile
                   </Button>
                )}
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 font-bold focus:ring-primary/20"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email (Immutable)</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input
                    disabled={true}
                    value={formData.email}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-100/50 pl-12 font-bold cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 font-bold focus:ring-primary/20"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input
                    type="number"
                    disabled={!isEditing}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 font-bold focus:ring-primary/20"
                    placeholder="25"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:col-span-2 flex justify-center mt-12 gap-4 overflow-hidden pt-4"
                  >
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={loading}
                      onClick={() => setIsEditing(false)}
                      className="rounded-2xl px-12 h-14 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px]"
                    >
                      <X className="w-4 h-4" /> Discard
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="rounded-2xl px-12 h-14 gap-2 bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-[10px]"
                    >
                      {loading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                         <Save className="w-4 h-4" />
                      )}
                      {loading ? "Syncing..." : "Save Biometrics"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {!isEditing && (
              <div className="mt-20 p-10 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-emerald-900 tracking-tight">System Integrity Secure</h4>
                      <p className="text-emerald-700/70 font-medium">Your profile is currently protected and all data is end-to-end synchronized.</p>
                   </div>
                </div>
                <div className="hidden md:block">
                   <Activity className="w-12 h-12 text-emerald-200" />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
