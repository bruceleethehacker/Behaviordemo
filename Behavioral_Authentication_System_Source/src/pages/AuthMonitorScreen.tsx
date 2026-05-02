import { useState, useEffect, useRef } from "react";
import { getBaseline, authenticateUser, type AuthStatus, type BehaviorFeatures } from "@/lib/behaviorStore";
import { CyberCard } from "@/components/CyberCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BottomNav } from "@/components/BottomNav";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Shield, UserCheck, AlertTriangle } from "lucide-react";

export default function AuthMonitorScreen() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const keyTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!monitoring) return;

    const handleKeyDown = () => {
      keyTimesRef.current.push(Date.now());
      addEvent("Keystroke detected");
    };
    const handleScroll = () => addEvent("Scroll event");
    const handleClick = () => addEvent("Tap/Click event");

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("click", handleClick);

    const interval = setInterval(() => {
      const baseline = getBaseline();
      const simulated: BehaviorFeatures = {
        typingSpeed: 25 + Math.random() * 40,
        typingRhythm: 0.5 + Math.random() * 0.4,
        scrollSpeed: 3 + Math.random() * 8,
        scrollPattern: 0.4 + Math.random() * 0.5,
        tapAccuracy: 0.5 + Math.random() * 0.5,
        tapReactionTime: 200 + Math.random() * 400,
        swipeVelocity: 200 + Math.random() * 600,
        swipeAngleConsistency: 0.5 + Math.random() * 0.4,
        motionStability: 0.5 + Math.random() * 0.4,
        timestamp: new Date().toISOString(),
      };
      const result = authenticateUser(simulated, baseline);
      setAuthStatus(result);
    }, 3000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      clearInterval(interval);
    };
  }, [monitoring]);

  const addEvent = (msg: string) => {
    setEvents(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p].slice(0, 20));
  };

  const isGenuine = authStatus?.status === "authenticated";

  return (
    <div className="min-h-screen p-4 pb-24 cyber-grid">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="text-center space-y-1">
          <Shield size={28} className="text-primary mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Real-Time Auth</h1>
          <p className="text-xs text-muted-foreground">Continuous behavioral monitoring</p>
        </div>

        {/* Status Card */}
        <CyberCard glow variant={isGenuine ? "success" : authStatus ? "danger" : "default"} className="text-center py-6">
          {!monitoring ? (
            <div className="space-y-4">
              <Shield size={48} className="text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Monitoring is paused</p>
              <button
                onClick={() => setMonitoring(true)}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
              >
                Start Monitoring
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {isGenuine ? (
                <UserCheck size={48} className="text-success mx-auto" />
              ) : (
                <AlertTriangle size={48} className="text-danger mx-auto" />
              )}
              <p className="text-lg font-bold text-foreground">
                {isGenuine ? "Genuine User" : authStatus?.status === "suspicious" ? "Suspicious Activity" : "Unknown"}
              </p>
              <StatusBadge status={authStatus?.status || "denied"} />
              <button
                onClick={() => setMonitoring(false)}
                className="mt-2 px-4 py-1 rounded bg-muted text-muted-foreground text-xs"
              >
                Stop
              </button>
            </div>
          )}
        </CyberCard>

        {/* Metrics */}
        {authStatus && monitoring && (
          <div className="grid grid-cols-2 gap-3">
            <CyberCard className="flex flex-col items-center py-4">
              <ScoreGauge value={authStatus.confidence} label="Confidence" size={80} />
            </CyberCard>
            <CyberCard className="flex flex-col items-center py-4">
              <ScoreGauge value={authStatus.riskScore} label="Risk Score" size={80} />
            </CyberCard>
          </div>
        )}

        {/* Security Status */}
        {authStatus && monitoring && (
          <CyberCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security Status</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={isGenuine ? "text-success" : "text-danger"}>{authStatus.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="text-foreground">{authStatus.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk</span>
                <span className="text-foreground">{authStatus.riskScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check</span>
                <span className="text-foreground">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CyberCard>
        )}

        {/* Event Log */}
        {monitoring && events.length > 0 && (
          <CyberCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Log</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {events.map((e, i) => (
                <p key={i} className="text-[10px] font-mono text-muted-foreground">{e}</p>
              ))}
            </div>
          </CyberCard>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
