import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetTasks,
  useDeleteTask,
  useUpdateTask,
  useGetDashboardSummary,
  useLogout,
  getGetMeQueryKey,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "Robin Sharma" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Productivity is never an accident. It is always the result of commitment.", author: "Paul J. Meyer" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600 border-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[priority] ?? "bg-muted text-muted-foreground"}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OverdueIcon() {
  return <span title="Overdue" className="text-amber-500 text-sm">⚠</span>;
}

interface TaskCardProps {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange?: (t: Task, newStatus: string) => void;
  compact?: boolean;
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, compact }: TaskCardProps) {
  const nextStatus: Record<string, string> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: "TODO",
  };

  return (
    <div className={`bg-white border border-border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow group ${task.status === "DONE" ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {task.isOverdue && <OverdueIcon />}
          <span className={`font-medium text-sm text-foreground truncate ${task.status === "DONE" ? "line-through" : ""}`}>
            {task.title}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-xs text-muted-foreground hover:text-destructive px-1.5 py-0.5 rounded hover:bg-destructive/10"
          >
            Delete
          </button>
        </div>
      </div>

      {!compact && task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {onStatusChange ? (
          <button
            onClick={() => onStatusChange(task, nextStatus[task.status] ?? "TODO")}
            className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-opacity hover:opacity-80 cursor-pointer ${STATUS_COLORS[task.status] ?? "bg-muted text-muted-foreground"}`}
            title="Click to advance status"
          >
            {STATUS_LABELS[task.status] ?? task.status}
          </button>
        ) : (
          <StatusBadge status={task.status} />
        )}
        {task.classificationName && (
          <span className="text-xs px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-medium">
            {task.classificationName}
          </span>
        )}
        {task.deadline && (
          <span className={`text-xs ${task.isOverdue ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
            📅 {task.deadline}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: summary } = useGetDashboardSummary();

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/login");
      },
    },
  });

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

  const todayTasks = useMemo(
    () => (tasks as Task[]).filter((t) => t.deadline === today && t.status !== "DONE"),
    [tasks, today],
  );

  const todoTasks = useMemo(() => (tasks as Task[]).filter((t) => t.status === "TODO"), [tasks]);
  const inProgressTasks = useMemo(() => (tasks as Task[]).filter((t) => t.status === "IN_PROGRESS"), [tasks]);
  const doneTasks = useMemo(() => (tasks as Task[]).filter((t) => t.status === "DONE"), [tasks]);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  function openCreate() {
    setEditingTask(null);
    setTaskFormOpen(true);
  }

  function openEdit(t: Task) {
    setEditingTask(t);
    setTaskFormOpen(true);
  }

  function handleStatusChange(t: Task, newStatus: string) {
    updateTask.mutate({ id: t.id, data: { status: newStatus as "TODO" | "IN_PROGRESS" | "DONE" } });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">TF</div>
            <span className="font-bold text-foreground text-lg tracking-tight">Task Force</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate({})}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Quote Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl px-6 py-5 text-white shadow-sm">
          <p className="text-base font-medium leading-relaxed">"{quote.text}"</p>
          <p className="text-sm text-emerald-100 mt-1">— {quote.author}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <StatCard label="Total" value={summary?.totalTasks ?? (tasks as Task[]).length} color="text-foreground" />
          <StatCard label="To Do" value={summary?.todoCount ?? todoTasks.length} color="text-slate-600" />
          <StatCard label="In Progress" value={summary?.inProgressCount ?? inProgressTasks.length} color="text-blue-600" />
          <StatCard label="Done" value={summary?.doneCount ?? doneTasks.length} color="text-emerald-600" />
          <StatCard label="Overdue" value={summary?.overdueCount ?? (tasks as Task[]).filter((t) => t.isOverdue).length} color="text-amber-500" />
          <StatCard label="Due Today" value={summary?.todayCount ?? todayTasks.length} color="text-primary" />
        </div>

        {/* Today's Focus */}
        {todayTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🎯</span>
              <h2 className="font-semibold text-foreground text-base">Today's Focus</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {todayTasks.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {todayTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEdit}
                  onDelete={setDeletingTask}
                  onStatusChange={handleStatusChange}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        {/* Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-base">All Tasks</h2>
            <Button onClick={openCreate} size="sm" className="gap-1.5">
              <span className="text-base leading-none">+</span>
              New Task
            </Button>
          </div>

          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            </TabsList>

            {/* List View */}
            <TabsContent value="list">
              {tasksLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : (tasks as Task[]).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-medium text-foreground">No tasks yet</p>
                  <p className="text-sm mt-1">Create your first task to get started</p>
                  <Button onClick={openCreate} className="mt-4" size="sm">Create a task</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {(tasks as Task[]).map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={openEdit}
                      onDelete={setDeletingTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Kanban Board */}
            <TabsContent value="kanban">
              {tasksLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { status: "TODO", label: "To Do", tasks: todoTasks, accent: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
                    { status: "IN_PROGRESS", label: "In Progress", tasks: inProgressTasks, accent: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
                    { status: "DONE", label: "Done", tasks: doneTasks, accent: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
                  ].map((col) => (
                    <div key={col.status} className={`rounded-xl border p-3 space-y-2 ${col.accent}`}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                        <span className="font-semibold text-sm text-foreground">{col.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground font-medium">{col.tasks.length}</span>
                      </div>
                      {col.tasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-xs">No tasks here</div>
                      ) : (
                        col.tasks.map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            onEdit={openEdit}
                            onDelete={setDeletingTask}
                            onStatusChange={handleStatusChange}
                            compact
                          />
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        editTask={editingTask}
      />

      {/* Delete Confirm Dialog */}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
