import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDoctors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "", experience: "", bio: "", profile_image: "" });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", specialization: "", experience: "", bio: "", profile_image: "" });
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/appointments/doctors/${editing._id}`, {
          fullName: form.name, specialization: form.specialization,
          experience: parseInt(form.experience) || 0, bio: form.bio, profileImage: form.profile_image,
        });
      } else {
        await api.post("/appointments/doctors", {
          fullName: form.name, email: form.email, password: form.password, 
          specialization: form.specialization,
          experience: parseInt(form.experience) || 0, bio: form.bio, profileImage: form.profile_image,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: editing ? "Doctor updated" : "Doctor added" });
      setOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!window.confirm("Are you sure you want to delete this doctor record? This action cannot be undone.")) return;
      await api.delete(`/appointments/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: "Doctor deleted" });
    },
  });

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.userId?.fullName || "", email: d.userId?.email || "", password: "", specialization: d.specialization, experience: String(d.experience), bio: d.bio || "", profile_image: d.profileImage || "" });
    setOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Doctors</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              {!editing && (
                <>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
                </>
              )}
              <div><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required /></div>
              <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required /></div>
              <div><Label>Profile Image URL</Label><Input value={form.profile_image} onChange={(e) => setForm({ ...form, profile_image: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Add Doctor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Doctor Identity</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Medical Area</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Clinical Exp</th>
                <th className="p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Secure Email</th>
                <th className="text-center p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {doctors?.map((d) => (
                <tr key={d._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10 shadow-inner">
                        {d.profileImage ? <img src={d.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-primary" />}
                      </div>
                      <span className="font-black text-foreground text-base tracking-tight">{d.userId?.fullName || "Doctor"}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold px-3 py-1 rounded-lg">
                      {d.specialization}
                    </Badge>
                  </td>
                  <td className="p-6 font-bold text-muted-foreground">{d.experience} Years Active</td>
                  <td className="p-6 font-medium text-muted-foreground italic underline decoration-primary/20">{d.userId?.email?.toLowerCase() || "N/A"}</td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-muted hover:shadow-sm text-muted-foreground hover:text-primary transition-all">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-all" onClick={() => { if(window.confirm("Permanent Action: Are you sure you want to remove this medical professional from the system?")) deleteMutation.mutate(d._id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
