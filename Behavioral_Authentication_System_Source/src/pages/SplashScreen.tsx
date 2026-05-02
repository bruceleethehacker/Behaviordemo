import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Fingerprint } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => navigate("/register"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center cyber-grid relative overflow-hidden">
      {/* Animated scan line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-px bg-primary/20" style={{ animation: "scanLine 3s linear infinite" }} />
      </div>

      <div className={`flex flex-col items-center gap-8 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-primary/40 flex items-center justify-center pulse-glow">
            <Shield size={48} className="text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Fingerprint size={16} className="text-secondary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">
            Behavioral Authentication
          </h1>
          <h2 className="text-lg font-semibold gradient-text">System</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your behavior is your password
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{ animation: `pulseGlow 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
