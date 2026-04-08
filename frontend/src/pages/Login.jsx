import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await signIn(email, password);
      toast({ title: "Welcome back!" });
      
      const dashboardPath = userData.role === "admin" ? "/admin" : userData.role === "doctor" ? "/doctor" : "/patient";
      navigate(dashboardPath);
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      
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
          <h1 className="text-3xl font-black text-foreground tracking-tight">Security Portal</h1>
          <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">Sign in to your clinical terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-10 rounded-[2.5rem] shadow-2xl border border-border space-y-8 backdrop-blur-xl transition-all duration-300">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Account Identifier</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="doctor@liohns.med"
                className="h-14 rounded-2xl border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all px-5 font-medium"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" name="password-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Encryption Key</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
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

          <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 bg-primary hover:scale-[0.98]" disabled={loading}>
            {loading ? "Decrypting..." : "Initialize Session"}
          </Button>

          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              New to the platform?{" "}
              <Link to="/register" className="text-primary hover:underline hover:scale-105 inline-block transition-transform">Enlist Now</Link>
            </p>
          </div>
        </form>
        
        <div className="mt-10 text-center">
            <Link to="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-primary transition-colors">← Abort to Primary Index</Link>
        </div>
      </div>
    </div>
  );
}
