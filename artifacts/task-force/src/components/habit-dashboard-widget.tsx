import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RobotFace, deriveProgressState, STATE_COLORS, type HelperState } from "@/components/habit-helper";
import { HabitProgressRing } from "@/components/habit-progress-ring";

const PROGRESS_MESSAGES: Record<HelperState, string> = {
  idle:        "Let's get started today.",
  firstHabit:  "Great start! Momentum builds from here.",
  starting:    "Great start! Keep going.",
  halfway:     "You're halfway there.",
  almost:      "Almost done! Finish strong.",
  oneLeft:     "Only one habit left. Finish strong!",
  celebrating: "Fantastic! All habits completed today!",
  excited:     "You're on fire! Keep the streak alive!",
  concerned:   "No pressure — just pick one habit to start with.",
};

interface HabitDashboardWidgetProps {
  completedHabits: number;
  totalHabits: number;
  currentStreak: number;
  onClick?: () => void;
}

export function HabitDashboardWidget({
  completedHabits,
  totalHabits,
  currentStreak,
  onClick,
}: HabitDashboardWidgetProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  const pct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const state = deriveProgressState(pct, currentStreak, totalHabits);
  const colors = STATE_COLORS[state];
  const message = PROGRESS_MESSAGES[state];

  useEffect(() => {
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
        blinkTimer = schedule();
      }, delay);
    };
    let blinkTimer = schedule();
    return () => clearTimeout(blinkTimer);
  }, []);

  const floatAnim =
    state === "celebrating"
      ? { y: [0, -10, 0, -6, 0], rotate: [-3, 3, 0] }
      : state === "almost" || state === "excited"
      ? { y: [0, -8, 0] }
      : state === "starting"
      ? { y: [0, -6, 0, -6, 0] }
      : { y: [0, -5, 0] };

  const floatTrans =
    state === "celebrating"
      ? { duration: 0.55, repeat: 3, repeatDelay: 2, ease: "easeOut" as const }
      : state === "almost" || state === "excited"
      ? { duration: 0.8, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" as const }
      : state === "starting"
      ? { duration: 0.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeOut" as const }
      : { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const };

  const bgClass =
    state === "celebrating" ? "from-violet-50 to-purple-50 border-violet-100"
    : state === "almost"    ? "from-orange-50 to-amber-50 border-orange-100"
    : state === "halfway"   ? "from-cyan-50 to-teal-50 border-cyan-100"
    : state === "starting"  ? "from-teal-50 to-green-50 border-teal-100"
    : "from-slate-50 to-white border-slate-100";

  return (
    <div
      className={`bg-gradient-to-br ${bgClass} border rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow select-none`}
      onClick={onClick}
      title="View Habits"
    >
      <div className="flex items-center gap-4">
        {/* Robot + ring side */}
        <div className="relative flex-shrink-0">
          {/* Glow ring for halfway+ */}
          {(state === "halfway" || state === "almost" || state === "celebrating") && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: `0 0 12px ${colors.glow}` }}
            />
          )}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
            style={{
              background: `linear-gradient(135deg, ${colors.head} 0%, #1e293b 100%)`,
              boxShadow: `0 4px 14px ${colors.glow}`,
            }}
          >
            <motion.div
              animate={floatAnim}
              transition={floatTrans}
            >
              <RobotFace state={state} isBlinking={isBlinking} />
            </motion.div>
          </div>
        </div>

        {/* Progress info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Today's Habits</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-semibold text-slate-700 leading-snug"
            >
              {message}
            </motion.p>
          </AnimatePresence>
          {totalHabits > 0 && (
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-600">{completedHabits} of {totalHabits}</span> habits complete
            </p>
          )}
          {currentStreak > 0 && (
            <p className="text-xs font-medium text-orange-600 flex items-center gap-1">
              🔥 <span>{currentStreak}-day streak</span>
            </p>
          )}
        </div>

        {/* Progress ring */}
        {totalHabits > 0 && (
          <div className="flex-shrink-0">
            <HabitProgressRing completed={completedHabits} total={totalHabits} size={70} strokeWidth={6} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalHabits > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                pct === 100 ? "bg-violet-500"
                : pct >= 75  ? "bg-orange-400"
                : pct >= 50  ? "bg-cyan-500"
                :              "bg-teal-400"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {totalHabits === 0 && (
        <p className="mt-2 text-xs text-slate-400 text-center">Click to create your first habit</p>
      )}
    </div>
  );
}
