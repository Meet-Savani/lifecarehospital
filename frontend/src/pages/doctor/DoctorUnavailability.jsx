import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Plus, Trash2, 
  AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorUnavailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [type, setType] = useState("Within a Day");
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00"
  });

  const { data: unavailabilities, isLoading } = useQuery({
    queryKey: ["doctor-unavailability"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/unavailability");
      return response.data;
    }
  });

  const setMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/appointments/doctor/unavailability", {
        ...data,
        type
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-unavailability"] });
      toast({ title: "Schedule Updated", description: "Your unavailability has been recorded." });
      setFormData({ startDate: "", endDate: "", startTime: "09:00", endTime: "17:00" });
    },
    onError: (err) => {
      toast({ title: "Failed to Update", description: err.message, variant: "destructive" });
    }
  });

  const handleFullDayBlock = () => {
    setMutation.mutate({
      ...formData,
      startTime: "00:00",
      endTime: "23:59"
    });
  };

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-10">
        <header>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Schedule <span className="text-orange-500 italic">Unavailability</span> 🗓️
          </motion.h1>
          <p className="text-slate-500 font-medium mt-2">Manage your clinical absence to prevent patient booking conflicts.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-12 xl:col-span-5">
            <Card className="border-none shadow-2xl shadow-slate-200 rounded-[3rem] overflow-hidden bg-white">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Absence Interval</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="Within a Day">Within a Day (e.g. Morning off)</SelectItem>
                      <SelectItem value="Multiple Days">Multiple Days (e.g. Vacation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      {type === "Within a Day" ? "Target Date" : "Start Date"}
                    </Label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                    />
                  </div>
                  {type === "Multiple Days" && (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</Label>
                      <Input 
                        type="date" 
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Quiet Time Start</Label>
                    <Input 
                      type="time" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Quiet Time End</Label>
                    <Input 
                      type="time" 
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button 
                    onClick={() => setMutation.mutate(formData)}
                    disabled={setMutation.isPending || !formData.startDate}
                    className="h-18 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-200"
                  >
                    Set Custom Interval
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleFullDayBlock}
                    disabled={setMutation.isPending || !formData.startDate}
                    className="h-12 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 font-black uppercase text-[10px] tracking-[0.2em]"
                  >
                    Block Entire Period (24/7)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List Side */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
             <div className="bg-white rounded-[3rem] border border-slate-100 p-10">
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-xl font-black text-slate-900">Current Restrictions</h2>
                   <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {unavailabilities?.length || 0} Records
                   </div>
                </div>

                <div className="space-y-4">
                   {unavailabilities?.map((u) => (
                      <motion.div 
                        key={u._id}
                        layout
                        className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 flex items-center justify-between group"
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${u.startTime === "00:00" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}`}>
                               {u.startTime === "00:00" ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                               <p className="font-black text-slate-900">
                                  {new Date(u.startDate).toLocaleDateString()}
                                  {u.type === "Multiple Days" && ` — ${new Date(u.endDate).toLocaleDateString()}`}
                               </p>
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                                  {u.startTime} to {u.endTime} • {u.type}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">Active</span>
                            {/* Deleting can be added if needed */}
                         </div>
                      </motion.div>
                   ))}
                   {unavailabilities?.length === 0 && (
                      <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-dashed border-2 border-slate-100">
                         <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="font-bold text-slate-400">Your schedule is currently clear.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
