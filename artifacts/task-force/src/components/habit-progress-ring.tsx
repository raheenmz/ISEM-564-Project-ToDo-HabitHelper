import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface HabitProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function HabitProgressRing({
  completed,
  total,
  size = 88,
  strokeWidth = 7,
}: HabitProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;

  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (v) => circumference * (1 - v));
  const prevPct = useRef(0);

  useEffect(() => {
    const ctrl = animate(progress, pct, {
      duration: 0.9,
      ease: "easeOut",
      from: prevPct.current,
    });
    prevPct.current = pct;
    return ctrl.stop;
  }, [pct, progress]);

  const displayPct = Math.round(pct * 100);

  const ringColor =
    displayPct === 100
      ? "#8b5cf6"
      : displayPct >= 50
      ? "#14b8a6"
      : displayPct > 0
      ? "#5eead4"
      : "#e2e8f0";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={displayPct}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-bold leading-none"
          style={{ color: displayPct === 100 ? "#8b5cf6" : "#0f172a" }}
        >
          {displayPct}%
        </motion.span>
        <span className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">today</span>
      </div>
    </div>
  );
}

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 100]);

interface HabitStreakBadgeProps {
  streak: number;
}

export function HabitStreakBadge({ streak }: HabitStreakBadgeProps) {
  if (streak === 0) return null;

  const isMilestone = STREAK_MILESTONES.has(streak);

  return (
    <motion.div
      key={streak}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
        isMilestone
          ? "bg-orange-50 border border-orange-200"
          : "bg-slate-50 border border-slate-200"
      }`}
    >
      <motion.span
        animate={
          isMilestone
            ? { scale: [1, 1.35, 1, 1.2, 1], rotate: [-8, 8, -4, 4, 0] }
            : { scale: 1 }
        }
        transition={
          isMilestone
            ? { duration: 0.7, ease: "easeInOut", repeat: 2, repeatDelay: 3 }
            : {}
        }
        className="text-sm leading-none"
      >
        🔥
      </motion.span>
      <span className={`text-xs font-bold leading-none ${isMilestone ? "text-orange-700" : "text-slate-600"}`}>
        {streak}
        <span className="font-normal text-slate-400"> day{streak !== 1 ? "s" : ""}</span>
      </span>
      {isMilestone && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[10px] font-semibold text-orange-500 leading-none"
        >
          🏆
        </motion.span>
      )}
    </motion.div>
  );
}
