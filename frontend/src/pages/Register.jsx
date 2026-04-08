import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Eye, EyeOff, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast({ title: "Registration secured!", description: "Welcome to the LIOHNS Health Network." });
      navigate("/patient");
    } catch (err) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter uppercase">LIOHNS</span>
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Accession Registry</h1>
          <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">Join the next generation of healthcare</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-10 rounded-[2.5rem] shadow-2xl border border-border space-y-8 backdrop-blur-xl transition-all duration-300">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</Label>
              <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                placeholder="Dr. John Doe / Patient Name"
                className="h-14 rounded-2xl border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all px-5 font-medium"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Communication Channel (Email)</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="contact@identity.med"
                className="h-14 rounded-2xl border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all px-5 font-medium"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password" name="password-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Passkey</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  minLength={6}
                  className="h-14 rounded-2xl border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all pl-5 pr-12 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border flex items-start gap-4">
             <ShieldCheck className="w-6 h-6 text-emerald-500 mt-0.5" />
             <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">By registering, you agree to our HIPPA-compliant data processing protocols and clinical service terms.</p>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 bg-primary hover:scale-[0.98]" disabled={loading}>
            {loading ? "Establishing Identity..." : "Finalize Enrollment"}
          </Button>

          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Already have an endpoint?{" "}
              <Link to="/login" className="text-primary hover:underline hover:scale-105 inline-block transition-transform">Sign Session</Link>
            </p>
          </div>
        </form>
        
        <div className="mt-10 text-center">
            <Link to="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-primary transition-colors">← Exit to Global Hub</Link>
        </div>
      </div>
    </div>
  );
}
