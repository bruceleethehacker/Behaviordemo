import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "authenticated" | "suspicious" | "denied" | "low" | "medium" | "high" | "critical";
  label?: string;
}

const styles: Record<string, string> = {
  authenticated: "bg-success/20 text-success border-success/30",
  low: "bg-success/20 text-success border-success/30",
  suspicious: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  denied: "bg-danger/20 text-danger border-danger/30",
  high: "bg-danger/20 text-danger border-danger/30",
  critical: "bg-danger/20 text-danger border-danger/30",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider", styles[status])}>
      {label || status}
    </span>
  );
}
