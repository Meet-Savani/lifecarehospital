import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { 
  MessageSquare, User, Search, Filter, 
  ChevronRight, Calendar, ArrowLeft, MoreVertical, Clock 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function AdminChats() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const { data: chats, isLoading } = useQuery({
    queryKey: ["admin-all-chats"],
    queryFn: async () => {
      const response = await api.get("/chat/admin/all");
      return response.data || [];
    },
  });

  const filteredChats = chats?.filter(chat => {
    const doctorName = chat.appointmentId?.doctorId?.userId?.fullName?.toLowerCase() || "";
    const patientName = chat.appointmentId?.patientId?.fullName?.toLowerCase() || "";
    const matchesSearch = doctorName.includes(search.toLowerCase()) || patientName.includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Communication <span className="text-primary italic">Surveillance</span> 🕵️‍♂️</h1>
            <p className="text-slate-500 font-medium mt-2">Monitor all doctor-patient interactions for quality assurance.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Search by name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 border-none bg-transparent w-64 focus-visible:ring-0 font-bold"
              />
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
               <Filter className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]" />
            ))
          ) : filteredChats?.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No active conversations found</p>
             </div>
          ) : (
            filteredChats.map((chat, i) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/chat/${chat.appointmentId._id}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex -space-x-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
                       {chat.appointmentId?.doctorId?.userId?.fullName?.charAt(0)}
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
                       {chat.appointmentId?.patientId?.fullName?.charAt(0)}
                     </div>
                  </div>
                  <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Active Session
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                    <p className="font-black text-slate-800 tracking-tight truncate">
                      Dr. {chat.appointmentId?.doctorId?.userId?.fullName} <span className="text-slate-300 font-medium mx-1">&</span> {chat.appointmentId?.patientId?.fullName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-4 border-t border-slate-50">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(chat.updatedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(new Date(chat.updatedAt), 'hh:mm a')}</span>
                  </div>
                </div>

                <Button className="w-full mt-6 h-12 rounded-2xl bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white border border-slate-100 shadow-none font-black text-xs uppercase tracking-widest transition-all">
                  Intervene / View Logs
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
