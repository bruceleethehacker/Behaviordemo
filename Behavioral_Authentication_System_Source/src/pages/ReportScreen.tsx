import { useEffect, useState } from "react";
import { getBaseline, computeScores, type BehaviorScores } from "@/lib/behaviorStore";
import { CyberCard } from "@/components/CyberCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreGauge } from "@/components/ScoreGauge";
import { BottomNav } from "@/components/BottomNav";
import { ShieldCheck, BarChart3 } from "lucide-react";

export default function ReportScreen() {
  const [scores, setScores] = useState<BehaviorScores | null>(null);

  useEffect(() => {
    const baseline = getBaseline();
    if (baseline) setScores(computeScores(baseline));
  }, []);

  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No enrollment data. Complete enrollment first.</p>
      </div>
    );
  }

  const scoreItems = [
    { label: "Typing Behavior", value: scores.typing },
    { label: "Scrolling Behavior", value: scores.scrolling },
    { label: "Tap Pattern", value: scores.tapPattern },
    { label: "Swipe Behavior", value: scores.swipe },
    { label: "Motion Stability", value: scores.motionStability },
  ];

  return (
    <div className="min-h-screen p-4 pb-24 cyber-grid">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="text-center space-y-1">
          <BarChart3 size={28} className="text-primary mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Behavior Report</h1>
          <p className="text-xs text-muted-foreground">Analysis of your behavioral biometrics</p>
        </div>

        {/* Overall Score */}
        <CyberCard glow className="flex flex-col items-center py-6">
          <div className="relative">
            <ScoreGauge value={scores.overallConfidence} label="Overall Confidence" size={120} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-success" />
            <span className="text-sm font-medium text-foreground">Risk Level:</span>
            <StatusBadge status={scores.riskLevel} />
          </div>
        </CyberCard>

        {/* Individual Scores */}
        <div className="grid grid-cols-2 gap-3">
          {scoreItems.map(item => (
            <CyberCard key={item.label} className="flex flex-col items-center py-4">
              <ScoreGauge value={item.value} label={item.label} size={80} />
            </CyberCard>
          ))}
        </div>

        {/* Score Bars */}
        <CyberCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detailed Breakdown</h3>
          <div className="space-y-3">
            {scoreItems.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.value}%`,
                      background: item.value >= 75
                        ? "hsl(160 70% 45%)"
                        : item.value >= 50
                        ? "hsl(38 92% 50%)"
                        : "hsl(0 70% 55%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>
      <BottomNav />
    </div>
  );
}
