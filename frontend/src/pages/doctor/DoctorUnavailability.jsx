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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
            className="text-4xl font-black text-foreground tracking-tight"
          >
            Schedule <span className="text-primary italic">Intelligence</span> 🗓️
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2">Manage clinical blackouts and availability overrides.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-10 items-start">
          <div className="xl:col-span-7">
            <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-card">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-black text-foreground">Blackout <span className="text-primary italic">Override</span></CardTitle>
                <p className="text-muted-foreground font-medium mt-1">Select date ranges to mark yourself as unavailable.</p>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Restriction Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border shadow-2xl bg-card">
                        <SelectItem value="Within a Day">Single Day Block</SelectItem>
                        <SelectItem value="Multiple Days">Time Range / Vacation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-[2] grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {type === "Within a Day" ? "Target Date" : "From"}
                      </Label>
                      <Input 
                        type="date" 
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary" 
                      />
                    </div>
                    {type === "Multiple Days" && (
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">To</Label>
                        <Input 
                          type="date" 
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</Label>
                    <Input 
                      type="time" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</Label>
                    <Input 
                      type="time" 
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="pt-2">
                    <Button 
                      onClick={() => setMutation.mutate(formData)}
                      disabled={setMutation.isPending || !formData.startDate}
                      className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-xl transition-all hover:scale-[1.02]"
                    >
                      {setMutation.isPending ? "Updating..." : "Set Interval"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-3 space-y-6">
             <div className="bg-card rounded-[3rem] border border-border p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black text-foreground">Summary</h2>
                   <Badge className="bg-muted text-muted-foreground border-none font-bold">
                      {unavailabilities?.length || 0}
                   </Badge>
                </div>

                <div className="space-y-4">
                   {unavailabilities?.map((u, i) => (
                      <motion.div 
                        key={u._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-muted/30 rounded-3xl border border-border group hover:bg-muted/50 transition-all"
                      >
                         <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <p className="font-black text-foreground">{new Date(u.startDate).toLocaleDateString()}</p>
                               <p className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> {u.startTime} - {u.endTime}
                                </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                              onClick={() => {
                                if (confirm("Remove this restriction?")) {
                                   api.delete(`/appointments/doctor/unavailability/${u._id}`)
                                     .then(() => {
                                       queryClient.invalidateQueries({ queryKey: ["doctor-unavailability"] });
                                       toast({ title: "Removed" });
                                     });
                                }
                              }}
                            >
                               <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </motion.div>
                   ))}
                   {unavailabilities?.length === 0 && (
                      <div className="text-center py-10 grayscale opacity-60">
                         <Calendar className="w-10 h-10 mx-auto mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clear Sky</p>
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
