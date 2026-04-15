import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Heart, Brain, Bone, Baby, Eye, Stethoscope, Activity, ShieldCheck } from "lucide-react";

const iconsMap = {
  Heart: Heart,
  Brain: Brain,
  Bone: Bone,
  Baby: Baby,
  Eye: Eye,
  Stethoscope: Stethoscope,
  Activity: Activity,
  ShieldCheck: ShieldCheck
};

export default function AdminServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "Stethoscope" });

  const { data: services } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await api.get("/content/services");
      return response.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/content/services/${editing._id}`, form);
      } else {
        await api.post("/content/services", form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: editing ? "Service updated" : "Service added" });
      setOpen(false);
      setForm({ title: "", description: "", icon: "Stethoscope" });
      setEditing(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/content/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: "Service deleted" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Services</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", description: "", icon: "Stethoscope" }); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div><Label>Icon Name</Label><p className="text-[10px] text-muted-foreground mb-1 italic">Options: Heart, Brain, Bone, Baby, Eye, Stethoscope, Activity, ShieldCheck</p><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Heart" /></div>
              <Button type="submit" className="w-full h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Service Configuration"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {services?.map((s) => {
          const iconKey = Object.keys(iconsMap).find(k => k.toLowerCase() === (s.icon || "").toLowerCase());
          const IconComponent = iconsMap[iconKey] || Stethoscope;
          return (
            <div key={s._id} className="bg-card p-10 rounded-[3rem] border border-border shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all group relative">
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <IconComponent className="w-8 h-8 text-primary shadow-sm" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-border/50 hover:border-primary/20 bg-card" onClick={() => { setEditing(s); setForm({ title: s.title, description: s.description, icon: s.icon || "Stethoscope" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-border/50 hover:border-destructive/20 bg-card" onClick={() => { if(window.confirm("Are you sure you want to delete this service?")) deleteMutation.mutate(s._id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-foreground mb-3 leading-tight tracking-tight">{s.title}</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">{s.description}</p>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
