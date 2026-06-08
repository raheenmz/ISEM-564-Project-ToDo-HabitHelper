import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface HabitHeatmapProps {
  doneDates: Set<string>;
  skippedDates: Set<string>;
}

type DayStatus = "done" | "skipped" | "missed" | "future" | "today-empty";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function shiftDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function displayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatus(date: Date, today: Date, doneDates: Set<string>, skippedDates: Set<string>): DayStatus {
  const dateStr = formatISO(date);
  const todayStr = formatISO(today);
  if (dateStr > todayStr) return "future";
  if (doneDates.has(dateStr)) return "done";
  if (skippedDates.has(dateStr)) return "skipped";
  if (dateStr === todayStr) return "today-empty";
  return "missed";
}

const STATUS_STYLES: Record<DayStatus, string> = {
  done:        "bg-teal-400 border-teal-300",
  skipped:     "bg-amber-300 border-amber-200",
  missed:      "bg-slate-100 border-slate-200",
  future:      "bg-slate-50 border-slate-100 opacity-40",
  "today-empty": "bg-slate-100 border-teal-300 ring-1 ring-teal-300",
};

const STATUS_LABEL: Record<DayStatus, string> = {
  done:          "Completed",
  skipped:       "Skipped",
  missed:        "Missed",
  future:        "Upcoming",
  "today-empty": "In progress",
};

interface TooltipState {
  dateStr: string;
  status: DayStatus;
  x: number;
  y: number;
}

export function HabitHeatmap({ doneDates, skippedDates }: HabitHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // find this week's Monday
  const dow = today.getDay(); // 0=Sun,1=Mon...
  const daysToMon = dow === 0 ? -6 : 1 - dow;
  const thisMonday = shiftDays(today, daysToMon);

  // Build 5 rows (weeks), Mon–Sun
  const weeks: { date: Date; dateStr: string; status: DayStatus }[][] = [];
  let cursor = shiftDays(thisMonday, -28);
  for (let w = 0; w < 5; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const dateStr = formatISO(date);
      week.push({ date, dateStr, status: getStatus(date, today, doneDates, skippedDates) });
      cursor = shiftDays(cursor, 1);
    }
    weeks.push(week);
  }

  const doneCount = weeks.flat().filter((c) => c.status === "done").length;
  const skippedCount = weeks.flat().filter((c) => c.status === "skipped").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Habit Calendar</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-400 inline-block" /> {doneCount} done</span>
          {skippedCount > 0 && (
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-300 inline-block" /> {skippedCount} skipped</span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] text-slate-400 font-medium">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map(({ date, dateStr, status }) => {
                const isToday = dateStr === formatISO(today);
                return (
                  <motion.div
                    key={dateStr}
                    className={`relative h-7 rounded-md border cursor-pointer transition-opacity ${STATUS_STYLES[status]}`}
                    whileHover={status !== "future" ? { scale: 1.15, zIndex: 10 } : {}}
                    onMouseEnter={(e) => {
                      if (status === "future") return;
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ dateStr, status, x: rect.left + rect.width / 2, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {status === "done" && isToday && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Flame className="w-3 h-3 text-white opacity-80" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              key={tooltip.dateStr}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg"
              style={{ left: tooltip.x, top: tooltip.y - 6 }}
            >
              <p className="font-semibold">{displayLabel(tooltip.dateStr)}</p>
              <p className="text-slate-300">{STATUS_LABEL[tooltip.status]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
        {([
          { color: "bg-teal-400", label: "Completed" },
          { color: "bg-amber-300", label: "Skipped" },
          { color: "bg-slate-100 border border-slate-200", label: "Missed" },
        ] as const).map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-sm ${color} inline-block`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
