import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CyberCard } from "@/components/CyberCard";
import { saveProfile } from "@/lib/behaviorStore";
import { useToast } from "@/hooks/use-toast";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || pin.length < 4) {
      toast({ title: "Validation Error", description: "Please fill all fields. PIN must be at least 4 digits.", variant: "destructive" });
      return;
    }
    saveProfile({ name: name.trim(), email: email.trim(), pin });
    toast({ title: "Registration Successful", description: "Proceeding to behavior enrollment..." });
    setTimeout(() => navigate("/enrollment"), 800);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 cyber-grid">
      <div className="w-full max-w-sm space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full border border-primary/30 flex items-center justify-center mb-4">
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Create Your Profile</h1>
          <p className="text-sm text-muted-foreground">Register to begin behavior enrollment</p>
        </div>

        <CyberCard glow>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="pl-10 bg-muted border-border" maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="pl-10 bg-muted border-border" maxLength={255} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Security PIN</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} type="password" placeholder="••••••" className="pl-10 bg-muted border-border" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Begin Enrollment
            </Button>
          </form>
        </CyberCard>
      </div>
    </div>
  );
}
