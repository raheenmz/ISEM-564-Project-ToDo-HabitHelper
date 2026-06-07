import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetTasks,
  useDeleteTask,
  useUpdateTask,
  useGetDashboardSummary,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Flag,
  LayoutGrid,
  List,
  ListTodo,
  LogOut,
  MoreHorizontal,
  Plus,
  CalendarDays,
} from "lucide-react";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "It always seems impossible until it's done.",
  "Done is better than perfect.",
  "Action is the foundational key to all success.",
  "Small daily improvements lead to staggering long-term results.",
  "The way to get started is to quit talking and begin doing.",
  "You don't have to be great to start, but you have to start to be great.",
  "May the Task Force be with you.",
  "Either you run the day or the day runs you.",
];

function getQuote() {
  return QUOTES[new Date().getDate() % QUOTES.length];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.deadline && b.deadline) {
      if (a.deadline < b.deadline) return -1;
      if (a.deadline > b.deadline) return 1;
    } else if (a.deadline) return -1;
    else if (b.deadline) return 1;
    return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
  });
}

const PRIORITY_STYLES: Record<string, { pill: string; border: string }> = {
  HIGH:   { pill: "bg-orange-50 text-orange-700", border: "border-l-orange-400" },
  MEDIUM: { pill: "bg-sky-50 text-sky-700",       border: "border-l-sky-400"    },
  LOW:    { pill: "bg-slate-100 text-slate-500",   border: "border-l-slate-300"  },
};

const STATUS_STYLES: Record<string, string> = {
  TODO:        "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  DONE:        "bg-lime-50 text-lime-700",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const NEXT_STATUS: Record<string, string> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

function PriorityPill({ priority }: { priority: string }) {
  const s = PRIORITY_STYLES[priority] ?? { pill: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${s.pill}`}>
      <Flag className="w-2.5 h-2.5" />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

function StatusPill({ status, onClick }: { status: string; onClick?: () => void }) {
  const cls = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500";
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-opacity hover:opacity-75 cursor-pointer whitespace-nowrap ${cls}`}
      title="Click to advance status"
    >
      {STATUS_LABELS[status] ?? status}
    </button>
  );
}

/* ── Focus card (Today's Focus row) ─────────────────────────── */
function FocusCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: string) => void;
}) {
  const border = PRIORITY_STYLES[task.priority]?.border ?? "border-l-slate-300";
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 border-l-4 ${border} flex flex-col gap-3 group`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className={`font-semibold text-slate-800 leading-snug ${task.status === "DONE" ? "line-through text-slate-400" : ""}`}>
          {task.isOverdue && <span className="text-amber-500 mr-1">⚠</span>}
          {task.title}
        </h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(task)} className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100">Edit</button>
          <button onClick={() => onDelete(task)} className="text-xs text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50">Del</button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <PriorityPill priority={task.priority} />
        <StatusPill status={task.status} onClick={() => onStatusChange(task, NEXT_STATUS[task.status] ?? "TODO")} />
        {task.classificationName && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{task.classificationName}</span>
        )}
      </div>
      {task.deadline && (
        <div className={`flex items-center gap-1 text-xs mt-auto ${task.isOverdue ? "text-amber-600 font-medium" : "text-slate-400"}`}>
          <CalendarDays className="w-3 h-3" /> {task.deadline}
        </div>
      )}
    </div>
  );
}

/* ── Kanban card ─────────────────────────────────────────────── */
function KanbanCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: string) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group ${task.status === "DONE" ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium text-sm text-slate-800 leading-snug ${task.status === "DONE" ? "line-through text-slate-400" : ""}`}>
          {task.isOverdue && <span className="text-amber-500 mr-1">⚠</span>}
          {task.title}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(task)} className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100">Edit</button>
          <button onClick={() => onDelete(task)} className="text-xs text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50">Del</button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <PriorityPill priority={task.priority} />
        {task.classificationName && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{task.classificationName}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        {task.deadline ? (
          <div className={`flex items-center gap-1 text-xs ${task.isOverdue ? "text-amber-600 font-medium" : "text-slate-400"}`}>
            <CalendarDays className="w-3 h-3" /> {task.deadline}
          </div>
        ) : <span />}
        <StatusPill status={task.status} onClick={() => onStatusChange(task, NEXT_STATUS[task.status] ?? "TODO")} />
      </div>
    </div>
  );
}

/* ── Stat tile ───────────────────────────────────────────────── */
function StatTile({ label, value, bg, textColor, icon }: {
  label: string; value: number; bg: string; textColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`${bg} rounded-3xl p-6 flex flex-col justify-between shadow-sm`} style={{ minHeight: "9rem" }}>
      <div className="bg-white/50 w-11 h-11 rounded-full flex items-center justify-center mb-3">
        {icon}
      </div>
      <div>
        <p className={`${textColor} font-medium text-sm mb-1 opacity-80`}>{label}</p>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

/* ══ Dashboard ══════════════════════════════════════════════════ */
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout, isLoggingOut } = useAuth();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"list" | "kanban">("list");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: summary } = useGetDashboardSummary();

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        setDeletingTask(null);
      },
    },
  });

  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    },
  });

  const today = todayStr();
  const quote = getQuote();
  const allTasks = tasks as Task[];

  const todayTasks    = useMemo(() => sortTasks(allTasks.filter((t) => t.deadline === today && t.status !== "DONE")), [allTasks, today]);
  const todoTasks     = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "TODO")), [allTasks]);
  const inProgressTasks = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "IN_PROGRESS")), [allTasks]);
  const doneTasks     = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "DONE")), [allTasks]);
  const sortedTasks   = useMemo(() => sortTasks(allTasks), [allTasks]);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  function openCreate() { setEditingTask(null); setTaskFormOpen(true); }
  function openEdit(t: Task) { setEditingTask(t); setTaskFormOpen(true); }
  function handleStatusChange(t: Task, newStatus: string) {
    updateTask.mutate({ id: t.id, data: { status: newStatus as "TODO" | "IN_PROGRESS" | "DONE" } });
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm">TF</div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Task Force</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">{isLoggingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Greeting + Quote ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-slate-100 flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Hey there, {user.name} 👋</h2>
            <p className="text-slate-500 italic text-sm">"{quote}"</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> New Task
          </button>
        </div>

        {/* ── Stat Tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Total" value={summary?.totalTasks ?? allTasks.length}
            bg="bg-teal-100" textColor="text-teal-900"
            icon={<ListTodo className="w-5 h-5 text-teal-800" />} />
          <StatTile label="To Do" value={summary?.todoCount ?? todoTasks.length}
            bg="bg-orange-100" textColor="text-orange-900"
            icon={<CircleDashed className="w-5 h-5 text-orange-800" />} />
          <StatTile label="In Progress" value={summary?.inProgressCount ?? inProgressTasks.length}
            bg="bg-sky-100" textColor="text-sky-900"
            icon={<Clock className="w-5 h-5 text-sky-800" />} />
          <StatTile label="Done" value={summary?.doneCount ?? doneTasks.length}
            bg="bg-lime-100" textColor="text-lime-900"
            icon={<CheckCircle2 className="w-5 h-5 text-lime-800" />} />
        </div>

        {/* ── Today's Focus ── */}
        {!tasksLoading && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <h2 className="font-semibold text-slate-800 text-base">Today's Focus</h2>
              {todayTasks.length > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">{todayTasks.length}</span>
              )}
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-400 bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm">
                No tasks due today — enjoy your day! ✨
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayTasks.map((t) => (
                  <FocusCard key={t.id} task={t} onEdit={openEdit} onDelete={setDeletingTask} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── All Tasks ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-base">All Tasks</h2>
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTab === "list" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTab === "kanban" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Kanban
              </button>
            </div>
          </div>

          {/* List View */}
          {activeTab === "list" && (
            tasksLoading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
            ) : sortedTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium text-slate-700">No tasks yet</p>
                <p className="text-sm text-slate-400 mt-1">Create your first task to get started</p>
                <button onClick={openCreate} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
                  Create a task
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-medium">
                      <th className="px-5 py-3.5 text-left font-normal w-10"></th>
                      <th className="px-5 py-3.5 text-left font-normal">Task</th>
                      <th className="px-4 py-3.5 text-left font-normal hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3.5 text-left font-normal">Priority</th>
                      <th className="px-4 py-3.5 text-left font-normal">Status</th>
                      <th className="px-4 py-3.5 text-left font-normal hidden md:table-cell">Deadline</th>
                      <th className="px-4 py-3.5 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((t) => (
                      <tr key={t.id} className={`border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 transition-colors ${t.status === "DONE" ? "opacity-60" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${t.status === "DONE" ? "bg-teal-500 border-teal-500" : "border-slate-300 group-hover:border-teal-400"}`}>
                            {t.status === "DONE" && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {t.isOverdue && <span className="text-amber-500 text-sm">⚠</span>}
                            <span className={`font-medium ${t.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"}`}>{t.title}</span>
                          </div>
                          {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          {t.classificationName
                            ? <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{t.classificationName}</span>
                            : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5"><PriorityPill priority={t.priority} /></td>
                        <td className="px-4 py-3.5">
                          <StatusPill status={t.status} onClick={() => handleStatusChange(t, NEXT_STATUS[t.status] ?? "TODO")} />
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {t.deadline
                            ? <span className={`text-xs whitespace-nowrap ${t.isOverdue ? "text-amber-600 font-medium" : "text-slate-400"}`}>{t.deadline}</span>
                            : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button onClick={() => openEdit(t)} className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100">Edit</button>
                            <button onClick={() => setDeletingTask(t)} className="text-xs text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Kanban View */}
          {activeTab === "kanban" && (
            tasksLoading ? (
              <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { status: "TODO",        label: "To Do",       tasks: todoTasks,       dot: "bg-orange-400", count: "bg-orange-100 text-orange-700" },
                  { status: "IN_PROGRESS", label: "In Progress", tasks: inProgressTasks, dot: "bg-sky-400",    count: "bg-sky-100 text-sky-700"    },
                  { status: "DONE",        label: "Done",        tasks: doneTasks,       dot: "bg-lime-500",   count: "bg-lime-100 text-lime-700"   },
                ].map((col) => (
                  <div key={col.status} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className={`w-3 h-3 rounded-full ${col.dot}`} />
                      <span className="font-semibold text-slate-700 text-sm">{col.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count}`}>{col.tasks.length}</span>
                    </div>
                    {col.tasks.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 text-xs text-slate-400">No tasks here</div>
                    ) : (
                      col.tasks.map((t) => (
                        <KanbanCard key={t.id} task={t} onEdit={openEdit} onDelete={setDeletingTask} onStatusChange={handleStatusChange} />
                      ))
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </main>

      {/* Task Form */}
      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        editTask={editingTask}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingTask} onOpenChange={(v) => { if (!v) setDeletingTask(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingTask?.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTask && deleteTask.mutate({ id: deletingTask.id })}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteTask.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
