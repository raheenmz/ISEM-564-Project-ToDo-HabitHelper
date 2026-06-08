import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Send, X } from "lucide-react";
import { useHabitRobotChat } from "@workspace/api-client-react";
import type { HabitRobotChatHabitItem } from "@workspace/api-client-react";

export type HelperState = "idle" | "starting" | "halfway" | "almost" | "celebrating" | "excited" | "concerned" | "firstHabit" | "oneLeft";

const STREAK_MILESTONES = [3, 7, 14, 30, 100];

export function deriveProgressState(
  pct: number,
  currentStreak: number,
  totalHabits: number,
  completedHabits?: number,
): HelperState {
  if (totalHabits === 0) return "idle";
  if (pct === 100) return "celebrating";
  if (completedHabits !== undefined && totalHabits - completedHabits === 1 && completedHabits > 0) return "oneLeft";
  if (pct >= 75) return "almost";
  if (pct >= 50) return "halfway";
  if (completedHabits === 1 && totalHabits > 1) return "firstHabit";
  if (pct > 0) return "starting";
  if (STREAK_MILESTONES.includes(currentStreak) && currentStreak > 0) return "excited";
  return "idle";
}

export const STATE_COLORS: Record<HelperState, { head: string; glow: string; antenna: string; badge: string }> = {
  idle:        { head: "#0f172a", glow: "rgba(20,184,166,0.15)",  antenna: "#5eead4", badge: "bg-slate-700"  },
  firstHabit:  { head: "#134e4a", glow: "rgba(20,184,166,0.32)",  antenna: "#2dd4bf", badge: "bg-teal-600"   },
  starting:    { head: "#134e4a", glow: "rgba(20,184,166,0.28)",  antenna: "#2dd4bf", badge: "bg-teal-600"   },
  halfway:     { head: "#0e4b4e", glow: "rgba(6,182,212,0.38)",   antenna: "#22d3ee", badge: "bg-cyan-600"   },
  almost:      { head: "#431407", glow: "rgba(249,115,22,0.35)",  antenna: "#fb923c", badge: "bg-orange-500" },
  oneLeft:     { head: "#431407", glow: "rgba(249,115,22,0.45)",  antenna: "#fb923c", badge: "bg-orange-500" },
  celebrating: { head: "#1e1b4b", glow: "rgba(139,92,246,0.40)", antenna: "#a78bfa", badge: "bg-violet-600" },
  excited:     { head: "#431407", glow: "rgba(249,115,22,0.30)",  antenna: "#fb923c", badge: "bg-orange-500" },
  concerned:   { head: "#1e293b", glow: "rgba(100,116,139,0.20)", antenna: "#94a3b8", badge: "bg-slate-500"  },
};

const EYE_COLORS: Record<HelperState, string> = {
  idle:        "#0d9488",
  firstHabit:  "#14b8a6",
  starting:    "#14b8a6",
  halfway:     "#06b6d4",
  almost:      "#f97316",
  oneLeft:     "#f97316",
  celebrating: "#8b5cf6",
  excited:     "#f97316",
  concerned:   "#64748b",
};

const MOUTH_PATHS: Record<HelperState, string> = {
  idle:        "M 20 42 Q 32 48 44 42",
  firstHabit:  "M 20 41 Q 32 50 44 41",
  starting:    "M 20 41 Q 32 49 44 41",
  halfway:     "M 20 41 Q 32 50 44 41",
  almost:      "M 18 40 Q 32 52 46 40",
  oneLeft:     "M 18 40 Q 32 52 46 40",
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

function SparkleParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [0, -14, -24] }}
      transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: 1.5, ease: "easeOut" }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M5 0 L5.6 3.8 L9 5 L5.6 6.2 L5 10 L4.4 6.2 L1 5 L4.4 3.8Z" fill="#f97316" />
      </svg>
    </motion.div>
  );
}

function SparklesOverlay() {
  const positions = [
    { x: -18, y: -18, delay: 0 },
    { x: 52, y: -12, delay: 0.3 },
    { x: -24, y: 38, delay: 0.6 },
    { x: 54, y: 42, delay: 0.2 },
    { x: 14, y: -22, delay: 0.9 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible" }}>
      {positions.map((p, i) => (
        <SparkleParticle key={i} x={p.x} y={p.y} delay={p.delay} />
      ))}
    </div>
  );
}

interface RobotFaceProps {
  state: HelperState;
  isBlinking: boolean;
}

export function RobotFace({ state, isBlinking }: RobotFaceProps) {
  const colors = STATE_COLORS[state];
  const eyeColor = EYE_COLORS[state];
  const mouthPath = MOUTH_PATHS[state];
  return (
    <svg viewBox="0 0 64 64" width="40" height="40" className="select-none">
      <line x1="32" y1="5" x2="32" y2="16" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <motion.circle
        cx="32" cy="4" r="4" fill={colors.antenna}
        animate={state === "excited" || state === "celebrating" || state === "almost"
          ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
          : { scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity }}
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
      {(state === "celebrating" || state === "excited" || state === "almost") && (
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

interface ChatMessage {
  role: "robot" | "user";
  text: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export interface HabitHelperProps {
  currentStreak: number;
  completedHabits: number;
  totalHabits: number;
  productivityScore: number;
  justCreatedHabit?: boolean;
  habitStats?: HabitRobotChatHabitItem[];
}

export function HabitHelper({
  currentStreak,
  completedHabits,
  totalHabits,
  productivityScore: _productivityScore,
  justCreatedHabit = false,
  habitStats = [],
}: HabitHelperProps) {
  const [expanded, setExpanded] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const _controls = useAnimationControls();

  const robotChat = useHabitRobotChat();

  const pct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const state: HelperState = justCreatedHabit
    ? "celebrating"
    : deriveProgressState(pct, currentStreak, totalHabits, completedHabits);

  const colors = STATE_COLORS[state];

  useEffect(() => {
    if (state === "celebrating" || state === "excited") {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state]);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, robotChat.isPending]);

  async function fetchInitialAnalysis() {
    setInitialized(true);
    try {
      const result = await robotChat.mutateAsync({ data: { habits: habitStats } });
      setMessages([{ role: "robot", text: result.reply }]);
    } catch {
      setMessages([{ role: "robot", text: "Hey! I'm having a little trouble connecting right now. Try sending me a message!" }]);
    }
  }

  function handleOpen() {
    setExpanded(true);
    if (!initialized) {
      fetchInitialAnalysis();
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || robotChat.isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    try {
      const result = await robotChat.mutateAsync({ data: { habits: habitStats, message: text } });
      setMessages((prev) => [...prev, { role: "robot", text: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "robot", text: "Oops, something went wrong. Try again!" }]);
    }
  }

  const floatAnimation =
    state === "celebrating"
      ? { y: [0, -14, 0, -8, 0], rotate: [-3, 3, -3, 2, 0] }
      : state === "almost" || state === "oneLeft" || state === "excited"
      ? { y: [0, -10, 0, -6, 0] }
      : state === "halfway"
      ? { y: [0, -6, 0] }
      : state === "firstHabit"
      ? { y: [0, -10, 0, -10, 0] }
      : state === "starting"
      ? { y: [0, -9, 0, -9, 0] }
      : state === "concerned"
      ? { y: [0, -3, 0], rotate: [-4, 4, 0] }
      : { y: [0, -7, 0] };

  const floatTransition =
    state === "celebrating"
      ? { duration: 0.55, ease: "easeOut" as const, repeat: 3, repeatDelay: 2 }
      : state === "almost" || state === "oneLeft" || state === "excited"
      ? { duration: 0.7, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 0.5 }
      : state === "halfway"
      ? { duration: 2.2, ease: "easeInOut" as const, repeat: Infinity }
      : state === "firstHabit"
      ? { duration: 0.45, ease: "easeOut" as const, repeat: 2, repeatDelay: 1.5 }
      : state === "starting"
      ? { duration: 0.5, ease: "easeOut" as const, repeat: Infinity, repeatDelay: 1.5 }
      : { duration: 2.8, ease: "easeInOut" as const, repeat: Infinity };

  const progressLabel =
    pct === 100  ? "You crushed it today! 🎊"
    : pct >= 75  ? "Almost done — finish strong!"
    : pct >= 50  ? "Halfway there. Keep going."
    : pct >= 25  ? "Good start, keep the momentum."
    : totalHabits > 0 ? "Time to start your habits!"
    : "Create habits to get started.";

  const headerBg =
    state === "celebrating" ? "bg-violet-50 border-b border-violet-100" :
    state === "almost"      ? "bg-orange-50 border-b border-orange-100" :
    state === "halfway"     ? "bg-cyan-50 border-b border-cyan-100"    :
    state === "starting"    ? "bg-teal-50 border-b border-teal-100"    :
                              "bg-slate-50 border-b border-slate-100";

  return (
    <div className="flex flex-col items-end gap-3">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ maxHeight: "480px" }}
          >
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between shrink-0 ${headerBg}`}>
              <div className="flex items-center gap-2">
                <RobotFace state={state} isBlinking={isBlinking} />
                <div>
                  <p className="text-xs font-semibold text-slate-700 leading-none">Habit Helper</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">AI-powered habit coach</p>
                </div>
              </div>
              <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar (compact) */}
            {totalHabits > 0 && (
              <div className="px-4 py-2.5 border-b border-slate-50 shrink-0">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400">Today's progress</span>
                  <span className="font-semibold text-slate-600">{completedHabits}/{totalHabits} · {pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      pct === 100 ? "bg-violet-500" :
                      pct >= 75   ? "bg-orange-400" :
                      pct >= 50   ? "bg-cyan-500"   :
                                    "bg-teal-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{progressLabel}</p>
              </div>
            )}

            {/* Streak badge (compact) */}
            {currentStreak > 0 && (
              <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-50 shrink-0">
                <span className="text-sm leading-none">🔥</span>
                <p className="text-xs font-semibold text-orange-700">{currentStreak}-day streak</p>
                <p className="text-xs text-orange-400 ml-auto">
                  {STREAK_MILESTONES.find((m) => m > currentStreak)
                    ? `${STREAK_MILESTONES.find((m) => m > currentStreak)! - currentStreak} to next milestone`
                    : "Incredible!"}
                </p>
              </div>
            )}

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.length === 0 && robotChat.isPending && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px]">🤖</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "robot" && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px]">🤖</span>
                    </div>
                  )}
                  <div
                    className={`text-xs leading-relaxed rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                      msg.role === "robot"
                        ? "bg-slate-50 text-slate-700 rounded-tl-sm"
                        : "bg-teal-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {messages.length > 0 && robotChat.isPending && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px]">🤖</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-slate-100 flex gap-2 items-center shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask me anything…"
                disabled={robotChat.isPending}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition placeholder:text-slate-300 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || robotChat.isPending}
                className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" style={{ overflow: "visible" }}>
        {showConfetti && <ConfettiBurst />}
        {(state === "almost" || state === "excited") && <SparklesOverlay />}

        {(state === "halfway" || state === "almost" || state === "celebrating") && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: `0 0 0 3px ${colors.antenna}55, 0 0 18px ${colors.glow}`,
            }}
          />
        )}

        <motion.button
          onClick={() => { if (expanded) { setExpanded(false); } else { handleOpen(); } }}
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

          {!expanded && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: colors.antenna }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-[8px] font-bold leading-none">
                {state === "celebrating" ? "★" : state === "almost" || state === "excited" ? "!" : state === "halfway" ? "½" : "✦"}
              </span>
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
