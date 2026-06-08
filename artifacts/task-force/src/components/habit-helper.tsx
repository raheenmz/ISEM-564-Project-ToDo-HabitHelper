import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { X } from "lucide-react";

type HelperState = "idle" | "encouraging" | "celebrating" | "excited" | "concerned";

const STREAK_MILESTONES = [3, 7, 14, 30, 100];

const MESSAGES: Record<HelperState, string[]> = {
  idle: [
    "Ready to tackle today's habits?",
    "Let's make today productive.",
    "Small habits, big results.",
    "Consistency is your superpower.",
  ],
  encouraging: [
    "Keep going! You're making progress.",
    "Halfway there — don't stop now!",
    "Almost done. You've got this.",
    "Every habit done is a win.",
  ],
  celebrating: [
    "Fantastic! You've completed all your habits today!",
    "You crushed it today! 🎉",
    "Full streak! Building consistency pays off.",
    "All done — enjoy the feeling of accomplishment!",
  ],
  excited: [
    "You're on fire! 🔥 Keep the streak alive!",
    "Consistency is paying off — amazing!",
    "Streak milestone unlocked! You're unstoppable.",
    "The habit loop is strong with this one.",
  ],
  concerned: [
    "Haven't seen you complete habits recently — small steps count!",
    "Let's get back on track. Even one habit makes a difference.",
    "Every day is a fresh start. Ready to begin?",
    "No pressure — just pick one habit to start with.",
  ],
};

function pickMessage(state: HelperState, streak: number): string {
  const milestone = STREAK_MILESTONES.find((m) => m === streak);
  if (state === "excited" && milestone) {
    return `🔥 ${milestone}-day streak unlocked! You're on fire!`;
  }
  const pool = MESSAGES[state];
  return pool[Math.floor(Math.random() * pool.length)];
}

function deriveState(
  completedHabits: number,
  totalHabits: number,
  currentStreak: number,
  productivityScore: number,
): HelperState {
  if (totalHabits === 0) return "idle";
  if (completedHabits === totalHabits) return "celebrating";
  if (STREAK_MILESTONES.includes(currentStreak) && currentStreak > 0) return "excited";
  if (productivityScore === 0 && totalHabits > 0) return "concerned";
  if (productivityScore >= 25) return "encouraging";
  return "idle";
}

const STATE_COLORS: Record<HelperState, { head: string; glow: string; antenna: string; badge: string }> = {
  idle:        { head: "#0f172a", glow: "rgba(20,184,166,0.15)", antenna: "#5eead4", badge: "bg-slate-700" },
  encouraging: { head: "#134e4a", glow: "rgba(20,184,166,0.25)", antenna: "#5eead4", badge: "bg-teal-700" },
  celebrating: { head: "#1e1b4b", glow: "rgba(139,92,246,0.35)", antenna: "#a78bfa", badge: "bg-violet-600" },
  excited:     { head: "#431407", glow: "rgba(249,115,22,0.30)", antenna: "#fb923c", badge: "bg-orange-500" },
  concerned:   { head: "#1e293b", glow: "rgba(100,116,139,0.20)", antenna: "#94a3b8", badge: "bg-slate-500" },
};

const EYE_COLORS: Record<HelperState, string> = {
  idle:        "#0d9488",
  encouraging: "#14b8a6",
  celebrating: "#8b5cf6",
  excited:     "#f97316",
  concerned:   "#64748b",
};

const MOUTH_PATHS: Record<HelperState, string> = {
  idle:        "M 20 42 Q 32 48 44 42",
  encouraging: "M 20 41 Q 32 49 44 41",
  celebrating: "M 18 40 Q 32 52 46 40",
  excited:     "M 18 40 Q 32 52 46 40",
  concerned:   "M 20 46 Q 32 40 44 46",
};

const CONFETTI_COLORS = ["#f97316", "#8b5cf6", "#14b8a6", "#f59e0b", "#ec4899", "#3b82f6"];

function ConfettiBurst() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const dist = 55 + Math.random() * 30;
    return {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 4 + Math.random() * 4,
      rotate: Math.random() * 360,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

interface RobotFaceProps {
  state: HelperState;
  isBlinking: boolean;
}

function RobotFace({ state, isBlinking }: RobotFaceProps) {
  const colors = STATE_COLORS[state];
  const eyeColor = EYE_COLORS[state];
  const mouthPath = MOUTH_PATHS[state];

  return (
    <svg viewBox="0 0 64 64" width="40" height="40" className="select-none">
      <line x1="32" y1="5" x2="32" y2="16" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <motion.circle
        cx="32" cy="4" r="4" fill={colors.antenna}
        animate={state === "excited" || state === "celebrating" ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: state === "excited" || state === "celebrating" ? Infinity : 0 }}
      />

      <motion.rect
        x="8" y="16" width="48" height="38" rx="10"
        fill={colors.head}
        animate={{ fill: colors.head }}
        transition={{ duration: 0.4 }}
      />

      <rect x="14" y="22" width="36" height="22" rx="6" fill="rgba(255,255,255,0.06)" />

      <motion.g
        animate={{ scaleY: isBlinking ? 0.08 : 1 }}
        transition={{ duration: 0.1 }}
        style={{ transformOrigin: "22px 32px" }}
      >
        <circle cx="22" cy="32" r="6" fill="rgba(255,255,255,0.15)" />
        <circle cx="22" cy="32" r="4.5" fill={eyeColor} />
        <circle cx="23.5" cy="30.5" r="1.5" fill="white" opacity="0.8" />
      </motion.g>

      <motion.g
        animate={{ scaleY: isBlinking ? 0.08 : 1 }}
        transition={{ duration: 0.1 }}
        style={{ transformOrigin: "42px 32px" }}
      >
        <circle cx="42" cy="32" r="6" fill="rgba(255,255,255,0.15)" />
        <circle cx="42" cy="32" r="4.5" fill={eyeColor} />
        <circle cx="43.5" cy="30.5" r="1.5" fill="white" opacity="0.8" />
      </motion.g>

      {(state === "celebrating" || state === "excited") && (
        <>
          <circle cx="14" cy="36" r="4" fill="#f472b6" opacity="0.35" />
          <circle cx="50" cy="36" r="4" fill="#f472b6" opacity="0.35" />
        </>
      )}

      <motion.path
        d={mouthPath}
        stroke="white"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        animate={{ d: mouthPath }}
        transition={{ duration: 0.4 }}
      />

      <rect x="20" y="54" width="24" height="5" rx="2.5" fill={colors.head} />
      <rect x="24" y="54" width="4" height="7" rx="1.5" fill="#334155" />
      <rect x="36" y="54" width="4" height="7" rx="1.5" fill="#334155" />
    </svg>
  );
}

export interface HabitHelperProps {
  currentStreak: number;
  completedHabits: number;
  totalHabits: number;
  productivityScore: number;
  justCreatedHabit?: boolean;
}

export function HabitHelper({
  currentStreak,
  completedHabits,
  totalHabits,
  productivityScore,
  justCreatedHabit = false,
}: HabitHelperProps) {
  const [expanded, setExpanded] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const bodyControls = useAnimationControls();

  const state = justCreatedHabit
    ? "celebrating"
    : deriveState(completedHabits, totalHabits, currentStreak, productivityScore);

  const colors = STATE_COLORS[state];

  const refreshMessage = useCallback(() => {
    setMessage(pickMessage(state, currentStreak));
  }, [state, currentStreak]);

  useEffect(() => {
    refreshMessage();
  }, [refreshMessage]);

  useEffect(() => {
    if (state === "celebrating" || state === "excited") {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state]);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        blinkTimer = schedule();
      }, delay);
    };
    let blinkTimer = schedule();
    return () => clearTimeout(blinkTimer);
  }, []);

  const floatAnimation =
    state === "celebrating" || state === "excited"
      ? { y: [0, -14, 0, -8, 0], rotate: [-3, 3, -3, 2, 0] }
      : state === "concerned"
      ? { y: [0, -3, 0], rotate: [-4, 4, 0] }
      : { y: [0, -7, 0] };

  const floatTransition =
    state === "celebrating" || state === "excited"
      ? { duration: 0.55, ease: "easeOut" as const, repeat: 3, repeatDelay: 2 }
      : state === "concerned"
      ? { duration: 2, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 1 }
      : { duration: 2.8, ease: "easeInOut" as const, repeat: Infinity };

  const pct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const progressLabel =
    pct === 100
      ? "You crushed it today! 🎊"
      : pct >= 75
      ? "Almost done — keep going!"
      : pct >= 50
      ? "Halfway there. Great work."
      : pct >= 25
      ? "Good start, keep the momentum."
      : totalHabits > 0
      ? "Time to start your habits!"
      : "Create habits to get started.";

  return (
    <div className="flex flex-col items-end gap-3">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className={`px-4 py-3 flex items-center justify-between ${
              state === "celebrating" ? "bg-violet-50 border-b border-violet-100" :
              state === "excited"     ? "bg-orange-50 border-b border-orange-100" :
              state === "encouraging" ? "bg-teal-50 border-b border-teal-100" :
              state === "concerned"   ? "bg-slate-50 border-b border-slate-100" :
                                        "bg-slate-50 border-b border-slate-100"
            }`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Habit Helper</p>
              <button
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{message}</p>

              {totalHabits > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Today's progress</span>
                    <span className="font-semibold text-slate-600">{completedHabits}/{totalHabits}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        pct === 100 ? "bg-violet-500" :
                        pct >= 50   ? "bg-teal-500" :
                                      "bg-teal-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{progressLabel}</p>
                </div>
              )}

              {currentStreak > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  <span className="text-base leading-none">🔥</span>
                  <div>
                    <p className="text-xs font-semibold text-orange-700">{currentStreak}-day streak</p>
                    <p className="text-xs text-orange-500">
                      {STREAK_MILESTONES.find((m) => m > currentStreak)
                        ? `${STREAK_MILESTONES.find((m) => m > currentStreak)! - currentStreak} days to next milestone`
                        : "Incredible consistency!"}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={refreshMessage}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-0.5"
              >
                Get another tip →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {showConfetti && <ConfettiBurst />}

        <motion.button
          onClick={() => setExpanded((v) => !v)}
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          style={{
            background: `linear-gradient(135deg, ${colors.head} 0%, #1e293b 100%)`,
            boxShadow: `0 4px 20px ${colors.glow}, 0 1px 3px rgba(0,0,0,0.3)`,
          }}
          animate={floatAnimation}
          transition={floatTransition}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          title="Habit Helper"
        >
          <RobotFace state={state} isBlinking={isBlinking} />

          <AnimatePresence>
            {(state === "celebrating" || state === "excited") && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                }}
              />
            )}
          </AnimatePresence>

          {!expanded && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: colors.antenna }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-[8px] font-bold leading-none">
                {state === "celebrating" ? "★" : state === "excited" ? "!" : state === "concerned" ? "?" : "✦"}
              </span>
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
