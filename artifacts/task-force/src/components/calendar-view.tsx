import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task, Group } from "@workspace/api-client-react";

interface CalendarViewProps {
  tasks: Task[];
  groups: Group[];
  onEditTask: (task: Task) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getPriorityColor(priority: string): string {
  if (priority === "HIGH") return "#ef4444";
  if (priority === "LOW") return "#0ea5e9";
  return "#f59e0b";
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function padDate(n: number) {
  return String(n).padStart(2, "0");
}

const MAX_VISIBLE = 3;

interface DayPopoverState {
  day: number;
  tasks: Task[];
  rect: DOMRect;
}

export function CalendarView({ tasks, groups, onEditTask }: CalendarViewProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`;

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [popover, setPopover] = useState<DayPopoverState | null>(null);

  const groupColorMap = useMemo(() => {
    const m = new Map<number, string>();
    groups.forEach((g) => {
      if (g.color) m.set(g.id, g.color);
    });
    return m;
  }, [groups]);

  const tasksByDate = useMemo(() => {
    const m = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.deadline) return;
      const prev = m.get(t.deadline) ?? [];
      m.set(t.deadline, [...prev, t]);
    });
    return m;
  }, [tasks]);

  const cells = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function getDayStr(day: number) {
    return `${viewYear}-${padDate(viewMonth + 1)}-${padDate(day)}`;
  }

  function openPopover(e: React.MouseEvent, day: number, moreTasks: Task[]) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ day, tasks: moreTasks, rect });
  }

  function getChipColor(task: Task): string {
    if (task.groupId != null) {
      const gc = groupColorMap.get(task.groupId);
      if (gc) return gc;
    }
    return getPriorityColor(task.priority);
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={goToday}
            className="text-xs font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-2 bg-slate-50/60 border-b border-slate-100 text-xs text-slate-500">
        <span className="font-medium">Priority:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Low</span>
        <span className="ml-2 text-slate-400">| Group color overrides priority color</span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] border-b border-r border-slate-50 bg-slate-50/40 last:border-r-0"
              />
            );
          }
          const dateStr = getDayStr(day);
          const isToday = dateStr === todayStr;
          const dayTasks = tasksByDate.get(dateStr) ?? [];
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE);
          const hiddenCount = dayTasks.length - MAX_VISIBLE;

          return (
            <div
              key={day}
              className={`min-h-[100px] border-b border-r border-slate-100 last:border-r-0 p-1.5 flex flex-col gap-0.5 ${isToday ? "bg-teal-50/30" : "hover:bg-slate-50/50"} transition-colors`}
            >
              {/* Day number */}
              <div className="flex justify-end mb-0.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isToday
                      ? "bg-teal-500 text-white"
                      : "text-slate-500"
                  }`}
                >
                  {day}
                </span>
              </div>

              {/* Task chips */}
              {visibleTasks.map((t) => {
                const chipColor = getChipColor(t);
                const isDone = t.status === "DONE";
                return (
                  <button
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    title={t.title}
                    className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: chipColor + "22",
                      color: chipColor,
                      borderLeft: `2px solid ${chipColor}`,
                      textDecoration: isDone ? "line-through" : undefined,
                      opacity: isDone ? 0.6 : 1,
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}

              {/* +X more */}
              {hiddenCount > 0 && (
                <button
                  onClick={(e) => openPopover(e, day, dayTasks.slice(MAX_VISIBLE))}
                  className="text-xs text-slate-400 hover:text-teal-600 font-medium px-1 transition-colors text-left"
                >
                  +{hiddenCount} more
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Popover for "+X more" */}
      {popover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopover(null)}
          />
          <div
            className="fixed z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 min-w-[200px] max-w-xs"
            style={{
              top: popover.rect.bottom + 8,
              left: Math.max(8, popover.rect.left - 60),
            }}
          >
            <p className="text-xs font-semibold text-slate-500 mb-2">
              {padDate(popover.day)} {MONTH_NAMES[viewMonth].slice(0, 3)} — {popover.tasks.length} more
            </p>
            <div className="space-y-1">
              {popover.tasks.map((t) => {
                const chipColor = getChipColor(t);
                return (
                  <button
                    key={t.id}
                    onClick={() => { onEditTask(t); setPopover(null); }}
                    className="w-full text-left text-xs px-2 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: chipColor + "22",
                      color: chipColor,
                      borderLeft: `2px solid ${chipColor}`,
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {tasks.filter((t) => t.deadline).length === 0 && (
        <div className="py-8 text-center text-slate-400 text-sm">
          <p className="text-2xl mb-2">📅</p>
          <p>No tasks with deadlines yet.</p>
          <p className="text-xs mt-1">Add a deadline to a task to see it here.</p>
        </div>
      )}
    </div>
  );
}
