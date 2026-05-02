import { useState, useEffect } from "react";
import { getBehaviorFeatures, getModelMetrics, saveModelMetrics, getBaseline, type BehaviorFeatures, type ModelMetrics } from "@/lib/behaviorStore";
import { CyberCard } from "@/components/CyberCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Settings, Database, Brain, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminScreen() {
  const [features, setFeatures] = useState<BehaviorFeatures[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics>(getModelMetrics());
  const [retraining, setRetraining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFeatures(getBehaviorFeatures());
  }, []);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      const newMetrics: ModelMetrics = {
        accuracy: 92 + Math.random() * 7,
        falseAcceptRate: 0.5 + Math.random() * 3,
        falseRejectRate: 1 + Math.random() * 4,
        lastTrained: new Date().toISOString(),
        samplesCollected: features.length,
      };
      saveModelMetrics(newMetrics);
      setMetrics(newMetrics);
      setRetraining(false);
      toast({ title: "Model Retrained", description: `Accuracy: ${newMetrics.accuracy.toFixed(1)}%` });
    }, 2500);
  };

  const handleExport = () => {
    const data = {
      baseline: getBaseline(),
      features,
      metrics,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `behavior-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report Exported", description: "JSON file downloaded successfully" });
  };

  return (
    <div className="min-h-screen p-4 pb-24 cyber-grid">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="text-center space-y-1">
          <Settings size={28} className="text-primary mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Developer & model management</p>
        </div>

        {/* Model Metrics */}
        <CyberCard glow>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model Metrics</h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-success">{metrics.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">False Accept Rate</span>
              <span className="text-warning">{metrics.falseAcceptRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">False Reject Rate</span>
              <span className="text-warning">{metrics.falseRejectRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Trained</span>
              <span className="text-foreground">{new Date(metrics.lastTrained).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Samples</span>
              <span className="text-foreground">{features.length}</span>
            </div>
          </div>
        </CyberCard>

        {/* Collected Features */}
        <CyberCard>
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collected Features</h3>
          </div>
          {features.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No features collected yet</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {features.map((f, i) => (
                <div key={i} className="p-2 rounded bg-muted text-[10px] font-mono space-y-1 border border-border">
                  <div className="text-muted-foreground">Sample {i + 1} — {new Date(f.timestamp).toLocaleString()}</div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <span>WPM: <span className="text-primary">{f.typingSpeed.toFixed(0)}</span></span>
                    <span>Rhythm: <span className="text-primary">{f.typingRhythm.toFixed(3)}</span></span>
                    <span>Scroll: <span className="text-primary">{f.scrollSpeed.toFixed(1)}</span></span>
                    <span>Tap: <span className="text-primary">{f.tapAccuracy.toFixed(3)}</span></span>
                    <span>Swipe: <span className="text-primary">{f.swipeVelocity.toFixed(1)}</span></span>
                    <span>Motion: <span className="text-primary">{f.motionStability.toFixed(3)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CyberCard>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleRetrain} disabled={retraining} className="bg-primary text-primary-foreground text-xs gap-2">
            <RefreshCw size={14} className={retraining ? "animate-spin" : ""} />
            {retraining ? "Training..." : "Retrain Model"}
          </Button>
          <Button onClick={handleExport} variant="outline" className="text-xs gap-2 border-border">
            <Download size={14} />
            Export Report
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
