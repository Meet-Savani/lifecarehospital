import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User, Search, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPatients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  const { data: patients, isLoading } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const response = await api.get("/auth/admin/patients");
      return response.data || [];
    },
  });

  const filteredPatients = patients?.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/auth/admin/users/${editing._id}`, form);
      } else {
        await api.post("/auth/register", { ...form, password: "Password123!", role: "patient" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast({ title: editing ? "Patient updated" : "Patient registered", description: !editing ? "Temporary password set to Password123!" : "" });
      setOpen(false);
      setEditing(null);
      setForm({ fullName: "", email: "", phone: "" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/auth/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast({ title: "Patient record deleted" });
    },
  });

  const openEdit = (p) => {
    setEditing(p);
    setForm({ fullName: p.fullName || "", email: p.email || "", phone: p.phone || "" });
    setOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient <span className="text-primary italic">Directory</span> 👥</h1>
             <p className="text-slate-500 font-medium">Manage hospital patient records and registrations.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Search name or ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 rounded-xl border-slate-100 bg-white w-full md:w-64"
              />
            </div>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) { setEditing(null); setForm({ fullName: "", email: "", phone: "" }); } }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2">
                   <Plus className="w-4 h-4" /> Register New
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-none p-10">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black">{editing ? "Update Dossier" : "New Patient Registration"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Identity</Label>
                      <Input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Communication Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mobile Contact</Label>
                      <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                   </div>
                   <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Processing..." : editing ? "Authorize Changes" : "Confirm Registration"}
                   </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                    <th className="p-6 pl-10">Identity</th>
                    <th className="p-6">Contact Channels</th>
                    <th className="p-6">Joined Records</th>
                    <th className="p-6 pr-10 text-right">Administrative Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {isLoading ? (
                   <tr><td colSpan={4} className="p-20 text-center text-slate-200 uppercase font-black tracking-widest">Compiling Records...</td></tr>
                 ) : filteredPatients?.length === 0 ? (
                   <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold">No matching records indexed.</td></tr>
                 ) : (
                   filteredPatients.map((p) => (
                     <tr key={p._id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="p-6 pl-10">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg group-hover:scale-110 transition-transform duration-500">
                                 {p.fullName?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900">{p.fullName}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PFID: {p._id.slice(-6)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Mail className="w-3 h-3" /> {p.email}</p>
                              <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Phone className="w-3 h-3" /> {p.phone || "No contact"}</p>
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-300" /> {new Date(p.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-6 pr-10 text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm">
                              <Pencil className="h-4 w-4 text-slate-400" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p._id)} className="h-10 w-10 rounded-xl hover:bg-destructive/5 text-slate-300 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
