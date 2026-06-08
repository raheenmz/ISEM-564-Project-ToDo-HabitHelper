import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlantStage {
  emoji: string;
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

function getPlantStage(streak: number): PlantStage {
  if (streak >= 30) {
    return {
      emoji: "🌲",
      label: "Flourishing Tree",
      description: "Your habits are deeply rooted.",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-200",
      glowColor: "rgba(16,185,129,0.2)",
    };
  }
  if (streak >= 15) {
    return {
      emoji: "🌳",
      label: "Plant",
      description: "Growing strong every day.",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      glowColor: "rgba(34,197,94,0.2)",
    };
  }
  if (streak >= 4) {
    return {
      emoji: "🌿",
      label: "Sprout",
      description: "You're building momentum!",
      bgColor: "bg-teal-50",
      textColor: "text-teal-800",
      borderColor: "border-teal-200",
      glowColor: "rgba(20,184,166,0.2)",
    };
  }
  return {
    emoji: "🌱",
    label: "Seed",
    description: "Every habit starts here.",
    bgColor: "bg-lime-50",
    textColor: "text-lime-800",
    borderColor: "border-lime-200",
    glowColor: "rgba(132,204,22,0.15)",
  };
}

interface HabitPlantWidgetProps {
  streak: number;
}

export function HabitPlantWidget({ streak }: HabitPlantWidgetProps) {
  const stage = getPlantStage(streak);
  const prevStreak = useRef(streak);
  const isGrowing = streak !== prevStreak.current && streak > prevStreak.current;

  useEffect(() => {
    prevStreak.current = streak;
  }, [streak]);

  const nextMilestone =
    streak < 4 ? 4 : streak < 15 ? 15 : streak < 30 ? 30 : null;
  const daysToNext = nextMilestone !== null ? nextMilestone - streak : null;

  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-4 ${stage.bgColor} ${stage.borderColor}`}
      style={{ boxShadow: `0 0 20px ${stage.glowColor}` }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.emoji}
          initial={isGrowing ? { scale: 0.5, rotate: -15, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="text-4xl leading-none select-none"
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            {stage.emoji}
          </motion.span>
        </motion.div>
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wide ${stage.textColor} opacity-70`}>
          Habit Growth
        </p>
        <p className={`font-bold text-sm ${stage.textColor}`}>{stage.label}</p>
        <p className={`text-xs ${stage.textColor} opacity-60 leading-snug`}>{stage.description}</p>

        {daysToNext !== null && streak > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] mb-0.5 opacity-60" style={{ color: "inherit" }}>
              <span className={stage.textColor}>Next level in {daysToNext} day{daysToNext !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/50 overflow-hidden">
              {(() => {
                const from = nextMilestone === 4 ? 0 : nextMilestone === 15 ? 4 : nextMilestone === 30 ? 15 : 30;
                const pct = Math.round(((streak - from) / ((nextMilestone ?? 30) - from)) * 100);
                return (
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "currentColor" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                );
              })()}
            </div>
          </div>
        )}

        {daysToNext === null && (
          <p className={`text-[10px] mt-1 font-semibold ${stage.textColor} opacity-70`}>
            🏆 Max level reached — incredible!
          </p>
        )}
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ["#f97316", "#8b5cf6", "#14b8a6", "#f59e0b", "#ec4899", "#3b82f6", "#22c55e"];

interface CelebrationParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  rotate: number;
  duration: number;
}

function generateParticles(count: number): CelebrationParticle[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * window.innerWidth * 1.4,
    y: -Math.random() * window.innerHeight * 1.2 - 50,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 720 - 360,
    duration: 1.2 + Math.random() * 0.8,
  }));
}

const CELEBRATION_MESSAGES = [
  "You completed all your habits today!",
  "Full streak achieved — incredible work!",
  "Every habit done. You're building something great.",
  "100% complete. You crushed today!",
];

interface HabitCelebrationModalProps {
  show: boolean;
  onClose: () => void;
  streak: number;
}

export function HabitCelebrationModal({ show, onClose, streak }: HabitCelebrationModalProps) {
  const particles = useRef<CelebrationParticle[]>([]);

  useEffect(() => {
    if (show) {
      particles.current = generateParticles(60);
    }
  }, [show]);

  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            {particles.current.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size * 0.5,
                  backgroundColor: p.color,
                  top: "50%",
                  left: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  rotate: p.rotate,
                  scale: 0.3,
                }}
                transition={{
                  duration: p.duration,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: i * 0.012,
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-4 leading-none"
              animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.2, 1.2, 1] }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              🎉
            </motion.div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">All habits complete!</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">{message}</p>

            {streak > 0 && (
              <motion.p
                className="text-sm font-semibold text-orange-600 mt-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                🔥 {streak}-day streak — keep it going!
              </motion.p>
            )}

            <motion.button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-2xl transition-all text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Keep it up! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
