import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, MessageSquare, ArrowRight, 
  Activity, Heart, Thermometer, Droplets
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const healthData = [
  { name: 'Mon', value: 72 },
  { name: 'Tue', value: 75 },
  { name: 'Wed', value: 68 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 74 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 72 },
];

const monthHealthData = [
  { name: 'Day 1', value: 71 }, { name: 'Day 5', value: 74 }, { name: 'Day 10', value: 68 }, { name: 'Day 15', value: 79 }, { name: 'Day 20', value: 73 }, { name: 'Day 25', value: 70 }, { name: 'Day 30', value: 72 }
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-recent-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const upcoming = appointments?.filter(a => ['pending', 'approved', 'pending_reschedule'].includes(a.status)) || [];

  const [chartRange, setChartRange] = useState('week');
  const [dynamicHealthData, setDynamicHealthData] = useState(healthData);

  useEffect(() => {
    if (user?.healthMetrics?.heartRate) {
      const base = user.healthMetrics.heartRate;
      const updated = healthData.map(d => ({
        ...d,
        value: base + Math.floor(Math.random() * 10) - 5
      }));
      setDynamicHealthData(updated);
    }
  }, [user]);

  const stats = [
    { label: "Heart Rate", value: `${user?.healthMetrics?.heartRate || 72} bpm`, icon: Heart, color: "text-red-500", bg: "bg-red-500/10", trend: "+2%" },
    { label: "Glucose", value: `${user?.healthMetrics?.glucose || 90} mg/dL`, icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10", trend: "-1%" },
    { label: "Body Temp", value: `${user?.healthMetrics?.temperature || 36.6} °C`, icon: Thermometer, color: "text-orange-500", bg: "bg-orange-500/10", trend: "0%" },
    { label: "Blood Pressure", value: user?.healthMetrics?.bloodPressure || "120/80", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+3%" },
  ];

  const chartData = chartRange === 'week' ? dynamicHealthData : monthHealthData;

  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-300">
      <DashboardLayout role="patient">
        <div className="p-8 space-y-12">
          <header>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold text-foreground tracking-tight"
            >
              Welcome, <span className="text-primary">{user?.fullName?.split(' ')[0]}</span> 👋
            </motion.h1>
            <p className="text-foreground/80 font-medium mt-2">Check your health metrics and upcoming appointments.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/80 bg-muted px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-card overflow-hidden">
              <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-foreground">Heart <span className="text-primary">Outlook</span></CardTitle>
                  <p className="text-foreground/80 mt-1 font-medium">Your {chartRange}ly heart rate activity</p>
                </div>
                <div className="flex bg-muted p-1 rounded-xl">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-lg text-xs font-bold transition-all ${chartRange === 'week' ? "bg-card shadow-sm text-foreground" : "text-foreground/80"}`}
                    onClick={() => setChartRange('week')}
                  >
                    Week
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-lg text-xs font-bold transition-all ${chartRange === 'month' ? "bg-card shadow-sm text-foreground" : "text-foreground/80"}`}
                    onClick={() => setChartRange('month')}
                  >
                    Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[350px] p-10 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 600}} dy={15} />
                    <YAxis hide={true} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '20px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-card text-card-foreground overflow-hidden flex flex-col h-full border hover:shadow-primary/10 transition-all duration-700">
                <CardHeader className="p-10">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Calendar className="w-7 h-7 text-primary" /> Schedule
                  </CardTitle>
                  <p className="text-foreground/80 font-medium mt-1">Manage your sessions</p>
                </CardHeader>
                <CardContent className="p-10 pt-0 flex-1 space-y-6">
                  {isLoading ? (
                    <div className="flex flex-col gap-4">
                      {[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-3xl" />)}
                    </div>
                  ) : upcoming?.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-muted/30 rounded-3xl border border-border">
                      <p className="text-foreground/80 text-sm font-medium">No appointments booked</p>
                      <Link to="/patient/book">
                        <Button variant="link" className="text-primary font-bold mt-2">Book a specialist</Button>
                      </Link>
                    </div>
                  ) : (
                    upcoming?.map((appt) => (
                      <motion.div 
                        key={appt._id} 
                        className="p-6 bg-muted/50 rounded-[2rem] border border-border hover:bg-muted transition-all group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {appt.doctorId?.userId?.fullName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground leading-none">{appt.doctorId?.userId?.fullName}</h4>
                            <p className="text-[10px] text-foreground/80 font-bold uppercase tracking-widest mt-1">
                              {appt.doctorId?.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(appt.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Clock className="w-3.5 h-3.5" />
                            {appt.time}
                          </div>
                        </div>
                        {appt.status === 'approved' && (
                          <Link to={`/chat/${appt._id}`}>
                            <Button className="w-full mt-6 h-12 rounded-2xl bg-primary text-white border-none hover:bg-primary/90 transition-all font-black text-xs gap-2 shadow-lg shadow-primary/20">
                               Start Consultation
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    ))
                  )}
                </CardContent>
                <div className="p-10 pt-0">
                  <Link to="/patient/appointments">
                    <Button variant="ghost" className="w-full text-foreground/80 hover:text-foreground hover:bg-muted rounded-2xl h-14 font-bold text-xs gap-3">
                      View Complete History <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
