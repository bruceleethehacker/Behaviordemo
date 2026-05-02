import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  variant?: "default" | "success" | "danger";
}

export function CyberCard({ children, className, glow = false, variant = "default" }: CyberCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 transition-all duration-300",
        glow && variant === "default" && "glow-border",
        glow && variant === "success" && "glow-success",
        glow && variant === "danger" && "glow-danger",
        !glow && "border border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
