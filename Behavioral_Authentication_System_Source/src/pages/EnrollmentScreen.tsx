import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CyberCard } from "@/components/CyberCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveBehaviorFeatures, saveBaseline, type BehaviorFeatures } from "@/lib/behaviorStore";
import { Keyboard, MousePointer, Pointer, ArrowLeftRight, Smartphone, CheckCircle2 } from "lucide-react";

const TESTS = [
  { id: "typing", label: "Typing Test", icon: Keyboard, duration: 60 },
  { id: "scroll", label: "Scroll Test", icon: MousePointer, duration: 45 },
  { id: "tap", label: "Tap Reaction Test", icon: Pointer, duration: 45 },
  { id: "swipe", label: "Swipe Gesture Test", icon: ArrowLeftRight, duration: 45 },
  { id: "motion", label: "Motion Stability", icon: Smartphone, duration: 45 },
] as const;

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Security is not just about passwords anymore. Behavioral biometrics analyze the unique way each person interacts with their device.";

export default function EnrollmentScreen() {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false, false]);
  const [featureData, setFeatureData] = useState<Partial<BehaviorFeatures>>({});

  // Typing test state
  const [typedText, setTypedText] = useState("");
  const typingStartRef = useRef(0);
  const keyTimesRef = useRef<number[]>([]);

  // Tap test state
  const [tapTargetPos, setTapTargetPos] = useState({ x: 50, y: 50 });
  const [tapCount, setTapCount] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const tapAppearTimeRef = useRef(0);

  // Scroll state
  const [scrollEvents, setScrollEvents] = useState<number[]>([]);

  // Swipe state
  const swipeStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [swipeVelocities, setSwipeVelocities] = useState<number[]>([]);
  const [swipeAngles, setSwipeAngles] = useState<number[]>([]);

  // Total timer
  useEffect(() => {
    const t = setInterval(() => setTotalElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Test timer
  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { finishCurrentTest(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [testActive, timeLeft]);

  const startTest = () => {
    setTestActive(true);
    setTimeLeft(TESTS[currentTest].duration);
    if (TESTS[currentTest].id === "typing") {
      setTypedText("");
      typingStartRef.current = Date.now();
      keyTimesRef.current = [];
    }
    if (TESTS[currentTest].id === "tap") {
      setTapCount(0);
      setTapTimes([]);
      moveTapTarget();
    }
    if (TESTS[currentTest].id === "scroll") setScrollEvents([]);
    if (TESTS[currentTest].id === "swipe") { setSwipeVelocities([]); setSwipeAngles([]); }
  };

  const finishCurrentTest = useCallback(() => {
    setTestActive(false);
    const test = TESTS[currentTest];
    const newData = { ...featureData };

    if (test.id === "typing") {
      const elapsed = (Date.now() - typingStartRef.current) / 60000;
      const words = typedText.trim().split(/\s+/).length;
      newData.typingSpeed = elapsed > 0 ? Math.round(words / elapsed) : 0;
      const intervals = keyTimesRef.current;
      if (intervals.length > 1) {
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
        newData.typingRhythm = Math.max(0, 1 - Math.sqrt(variance) / avg);
      } else newData.typingRhythm = 0.5;
    }
    if (test.id === "scroll") {
      const speeds = scrollEvents;
      newData.scrollSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + Math.abs(b), 0) / speeds.length : 0;
      if (speeds.length > 1) {
        const avg = speeds.reduce((a, b) => a + Math.abs(b), 0) / speeds.length;
        const variance = speeds.reduce((a, b) => a + Math.pow(Math.abs(b) - avg, 2), 0) / speeds.length;
        newData.scrollPattern = Math.max(0, 1 - Math.sqrt(variance) / (avg || 1));
      } else newData.scrollPattern = 0.5;
    }
    if (test.id === "tap") {
      newData.tapAccuracy = Math.min(1, tapCount / 15);
      newData.tapReactionTime = tapTimes.length > 0 ? tapTimes.reduce((a, b) => a + b, 0) / tapTimes.length : 500;
    }
    if (test.id === "swipe") {
      newData.swipeVelocity = swipeVelocities.length > 0 ? swipeVelocities.reduce((a, b) => a + b, 0) / swipeVelocities.length : 0;
      if (swipeAngles.length > 1) {
        const avg = swipeAngles.reduce((a, b) => a + b, 0) / swipeAngles.length;
        const variance = swipeAngles.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / swipeAngles.length;
        newData.swipeAngleConsistency = Math.max(0, 1 - Math.sqrt(variance) / 180);
      } else newData.swipeAngleConsistency = 0.7;
    }
    if (test.id === "motion") {
      // Simulated motion stability (in real app, use DeviceMotion API)
      newData.motionStability = 0.6 + Math.random() * 0.35;
    }

    setFeatureData(newData);
    const newCompleted = [...completed];
    newCompleted[currentTest] = true;
    setCompleted(newCompleted);

    if (currentTest < TESTS.length - 1) {
      setCurrentTest(currentTest + 1);
    }
  }, [currentTest, featureData, typedText, scrollEvents, tapCount, tapTimes, swipeVelocities, swipeAngles, completed]);

  const moveTapTarget = () => {
    setTapTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    tapAppearTimeRef.current = Date.now();
  };

  const handleTap = () => {
    const reaction = Date.now() - tapAppearTimeRef.current;
    setTapTimes(p => [...p, reaction]);
    setTapCount(p => p + 1);
    moveTapTarget();
  };

  const handleFinishAll = () => {
    const features: BehaviorFeatures = {
      typingSpeed: featureData.typingSpeed || 0,
      typingRhythm: featureData.typingRhythm || 0,
      scrollSpeed: featureData.scrollSpeed || 0,
      scrollPattern: featureData.scrollPattern || 0,
      tapAccuracy: featureData.tapAccuracy || 0,
      tapReactionTime: featureData.tapReactionTime || 0,
      swipeVelocity: featureData.swipeVelocity || 0,
      swipeAngleConsistency: featureData.swipeAngleConsistency || 0,
      motionStability: featureData.motionStability || 0,
      timestamp: new Date().toISOString(),
    };
    saveBehaviorFeatures(features);
    saveBaseline(features);
    navigate("/report");
  };

  const allDone = completed.every(Boolean);
  const overallProgress = (completed.filter(Boolean).length / TESTS.length) * 100;
  const test = TESTS[currentTest];

  return (
    <div className="min-h-screen p-4 pb-24 cyber-grid">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-foreground">Behavior Enrollment</h1>
          <p className="text-xs text-muted-foreground">Complete all 5 tests to build your profile</p>
        </div>

        {/* Timer & Progress */}
        <CyberCard glow>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-mono">ELAPSED: {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground">{completed.filter(Boolean).length}/{TESTS.length} Complete</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          {testActive && (
            <div className="mt-2 text-center">
              <span className="text-2xl font-mono font-bold text-primary">{timeLeft}s</span>
            </div>
          )}
        </CyberCard>

        {/* Test Steps */}
        <div className="flex gap-2">
          {TESTS.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={t.id} className={`flex-1 flex flex-col items-center p-2 rounded-lg border transition-all ${
                i === currentTest ? "border-primary bg-primary/10" : completed[i] ? "border-success/30 bg-success/5" : "border-border"
              }`}>
                <Icon size={16} className={completed[i] ? "text-success" : i === currentTest ? "text-primary" : "text-muted-foreground"} />
                <span className="text-[9px] mt-1 text-muted-foreground text-center leading-tight">{t.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Active Test Area */}
        <CyberCard className="min-h-[280px] relative">
          <div className="flex items-center gap-2 mb-3">
            {(() => { const Icon = test.icon; return <Icon size={18} className="text-primary" />; })()}
            <h2 className="text-sm font-semibold text-foreground">{test.label}</h2>
          </div>

          {!testActive && !completed[currentTest] && (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <p className="text-xs text-muted-foreground text-center">
                {test.id === "typing" && "Type the displayed text naturally"}
                {test.id === "scroll" && "Scroll up and down in the area below"}
                {test.id === "tap" && "Tap the appearing targets as quickly as possible"}
                {test.id === "swipe" && "Swipe in different directions"}
                {test.id === "motion" && "Hold your phone steady for stability analysis"}
              </p>
              <Button onClick={startTest} className="bg-primary text-primary-foreground">Start Test</Button>
            </div>
          )}

          {testActive && test.id === "typing" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed border border-border rounded p-3">{SAMPLE_TEXT}</p>
              <textarea
                value={typedText}
                onChange={e => {
                  setTypedText(e.target.value);
                  keyTimesRef.current.push(Date.now());
                }}
                className="w-full h-24 bg-muted border border-border rounded-md p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                placeholder="Start typing..."
                autoFocus
              />
            </div>
          )}

          {testActive && test.id === "scroll" && (
            <div
              className="h-48 overflow-y-auto bg-muted rounded-md p-3 border border-border"
              onScroll={e => {
                setScrollEvents(p => [...p, (e.target as HTMLElement).scrollTop]);
              }}
            >
              {Array.from({ length: 50 }, (_, i) => (
                <p key={i} className="text-xs text-muted-foreground py-1 border-b border-border/50">
                  Scroll data line {i + 1} — behavioral biometric sample collection
                </p>
              ))}
            </div>
          )}

          {testActive && test.id === "tap" && (
            <div className="h-48 relative bg-muted rounded-md border border-border overflow-hidden">
              <button
                onClick={handleTap}
                className="absolute w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-all hover:scale-110"
                style={{ left: `${tapTargetPos.x}%`, top: `${tapTargetPos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <Pointer size={16} className="text-primary-foreground" />
              </button>
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground font-mono">
                Taps: {tapCount}
              </div>
            </div>
          )}

          {testActive && test.id === "swipe" && (
            <div
              className="h-48 bg-muted rounded-md border border-border flex items-center justify-center select-none"
              onTouchStart={e => {
                const t = e.touches[0];
                swipeStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
              }}
              onTouchEnd={e => {
                if (!swipeStartRef.current) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - swipeStartRef.current.x;
                const dy = t.clientY - swipeStartRef.current.y;
                const dt = (Date.now() - swipeStartRef.current.t) / 1000;
                const dist = Math.sqrt(dx * dx + dy * dy);
                setSwipeVelocities(p => [...p, dist / dt]);
                setSwipeAngles(p => [...p, Math.atan2(dy, dx) * 180 / Math.PI]);
                swipeStartRef.current = null;
              }}
              onMouseDown={e => {
                swipeStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
              }}
              onMouseUp={e => {
                if (!swipeStartRef.current) return;
                const dx = e.clientX - swipeStartRef.current.x;
                const dy = e.clientY - swipeStartRef.current.y;
                const dt = (Date.now() - swipeStartRef.current.t) / 1000;
                const dist = Math.sqrt(dx * dx + dy * dy);
                setSwipeVelocities(p => [...p, dist / (dt || 0.01)]);
                setSwipeAngles(p => [...p, Math.atan2(dy, dx) * 180 / Math.PI]);
                swipeStartRef.current = null;
              }}
            >
              <p className="text-xs text-muted-foreground">Swipe in any direction<br /><span className="font-mono">Swipes: {swipeVelocities.length}</span></p>
            </div>
          )}

          {testActive && test.id === "motion" && (
            <div className="h-48 flex flex-col items-center justify-center gap-3">
              <Smartphone size={48} className="text-primary animate-pulse" />
              <p className="text-xs text-muted-foreground text-center">Hold your device steady...<br />Analyzing motion patterns</p>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2 h-8 rounded-full bg-primary/30 overflow-hidden">
                    <div className="w-full bg-primary rounded-full" style={{
                      height: `${30 + Math.random() * 70}%`,
                      transition: "height 0.5s",
                    }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed[currentTest] && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <CheckCircle2 size={40} className="text-success" />
              <p className="text-sm text-success font-medium">Test Complete!</p>
            </div>
          )}
        </CyberCard>

        {/* Feature collection status */}
        <CyberCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Feature Collection</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">Typing WPM</span><span className="text-primary">{featureData.typingSpeed?.toFixed(0) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rhythm</span><span className="text-primary">{featureData.typingRhythm?.toFixed(2) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scroll Spd</span><span className="text-primary">{featureData.scrollSpeed?.toFixed(1) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tap Acc</span><span className="text-primary">{featureData.tapAccuracy?.toFixed(2) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Swipe Vel</span><span className="text-primary">{featureData.swipeVelocity?.toFixed(1) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Motion</span><span className="text-primary">{featureData.motionStability?.toFixed(2) || "—"}</span></div>
          </div>
        </CyberCard>

        {allDone && (
          <Button onClick={handleFinishAll} className="w-full bg-secondary text-secondary-foreground font-semibold text-sm">
            Generate Behavior Report →
          </Button>
        )}
      </div>
    </div>
  );
}
