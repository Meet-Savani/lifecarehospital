import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  ArrowRight, 
  Activity,
  UserCircle,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DoctorQuickAccess() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["doctor-quick-stats"],
    queryFn: async () => {
      const res = await api.get("/appointments/appointments");
      const appts = res.data || [];
      const today = new Date().toLocaleDateString();
      
      return {
        todayCount: appts.filter(a => new Date(a.date).toLocaleDateString() === today).length,
        pendingCount: appts.filter(a => a.status === 'pending').length,
        totalPatients: new Set(appts.map(a => a.patientId?._id)).size
      };
    }
  });

  return (
    <section className="py-12 bg-background relative z-20 -mt-16 sm:-mt-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-64 h-64 text-primary" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Clinical Overview</h2>
              <p className="text-muted-foreground">Quick access to your daily medical operations.</p>
            </div>
            <Link to="/doctor">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all group">
                Go to Full Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <QuickStatCard 
              icon={<Calendar className="w-6 h-6" />}
              label="Today's Appointments"
              value={stats?.todayCount || 0}
              color="bg-blue-500"
              link="/doctor/appointments"
            />
            <QuickStatCard 
              icon={<Clock className="w-6 h-6" />}
              label="Pending Requests"
              value={stats?.pendingCount || 0}
              color="bg-amber-500"
              link="/doctor/appointments"
            />
            <QuickStatCard 
              icon={<Users className="w-6 h-6" />}
              label="Active Patients"
              value={stats?.totalPatients || 0}
              color="bg-emerald-500"
              link="/doctor/history"
            />
            <div className="grid grid-cols-2 gap-4">
               <ActionButton icon={<UserCircle />} label="Profile" link="/doctor/profile" />
               <ActionButton icon={<Bell />} label="Alerts" link="/doctor/notifications" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickStatCard({ icon, label, value, color, link }) {
  return (
    <Link to={link} className="block group">
      <div className="bg-muted/50 hover:bg-muted p-6 rounded-[2rem] border border-border/50 transition-all duration-300">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
          {icon}
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{label}</div>
      </div>
    </Link>
  );
}

function ActionButton({ icon, label, link }) {
  return (
    <Link to={link} className="flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-primary/10 hover:border-primary/20 border border-transparent p-4 rounded-3xl transition-all group">
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">{label}</span>
    </Link>
  );
}
