import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetHabits,
  useGetTasks,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useGenerateTodayHabitTasks,
  useAiSuggestHabitTasks,
  useCreateTask,
  useGetClassifications,
  getGetHabitsQueryKey,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { Habit, Classification } from "@workspace/api-client-react";
import { HabitHelper } from "@/components/habit-helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  CalendarDays,
  CheckSquare,
  Flag,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Square,
  Trash2,
  Zap,
} from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-sky-50 text-sky-700",
  LOW: "bg-slate-100 text-slate-500",
};

const NO_CATEGORY = "__none__";

interface HabitFormData {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  classificationId: string;
  startDate: string;
  isActive: boolean;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function defaultForm(): HabitFormData {
  return {
    title: "",
    description: "",
    priority: "MEDIUM",
    classificationId: "",
    startDate: todayStr(),
    isActive: true,
  };
}

interface HabitFormDialogProps {
  open: boolean;
  onClose: () => void;
  editHabit?: Habit | null;
  classifications: Classification[];
  onCreated?: () => void;
}

function HabitFormDialog({ open, onClose, editHabit, classifications, onCreated }: HabitFormDialogProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<HabitFormData>(defaultForm());
  const [error, setError] = useState("");

  const createHabit = useCreateHabit({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetHabitsQueryKey() });
        onCreated?.();
        onClose();
      },
      onError: () => setError("Failed to save habit. Please try again."),
    },
  });

  const updateHabit = useUpdateHabit({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetHabitsQueryKey() });
        onClose();
      },
      onError: () => setError("Failed to update habit. Please try again."),
    },
  });

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setError("");
      if (editHabit) {
        setForm({
          title: editHabit.title,
          description: editHabit.description ?? "",
          priority: editHabit.priority as "LOW" | "MEDIUM" | "HIGH",
          classificationId: editHabit.classificationId ? String(editHabit.classificationId) : "",
          startDate: editHabit.startDate,
          isActive: editHabit.isActive,
        });
      } else {
        setForm(defaultForm());
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }

    const data = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      classificationId: form.classificationId ? Number(form.classificationId) : undefined,
      startDate: form.startDate,
      isActive: form.isActive,
    };

    if (editHabit) {
      updateHabit.mutate({ habitId: editHabit.id, data: { ...data, classificationId: data.classificationId ?? null } });
    } else {
      createHabit.mutate({ data });
    }
  }

  const isPending = createHabit.isPending || updateHabit.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { handleOpenChange(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editHabit ? "Edit Habit" : "New Habit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="habit-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="habit-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Morning exercise"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-desc">Description</Label>
            <Textarea
              id="habit-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What does this habit involve?"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as "LOW" | "MEDIUM" | "HIGH" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.classificationId || NO_CATEGORY}
                onValueChange={(v) => setForm((f) => ({ ...f, classificationId: v === NO_CATEGORY ? "" : v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>None</SelectItem>
                  {classifications.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="habit-start">Start Date</Label>
              <Input
                id="habit-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? "active" : "paused"}
                onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === "active" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editHabit ? "Save changes" : "Create habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AiSuggestion {
  title: string;
  description: string;
  deadline: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  selected: boolean;
}

interface AiHelperProps {
  onTasksAdded: () => void;
}

function AiHabitHelper({ onTasksAdded }: AiHelperProps) {
  const qc = useQueryClient();
  const [goal, setGoal] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingTasks, setAddingTasks] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const aiSuggest = useAiSuggestHabitTasks();
  const createTask = useCreateTask();

  async function handleSuggest() {
    if (!goal.trim()) return;
    setIsLoading(true);
    setError("");
    setSuggestions([]);
    setSuccessMsg("");

    try {
      const result = await aiSuggest.mutateAsync({
        data: { goal: goal.trim(), targetDate: targetDate || undefined },
      });
      const items = (result.suggestions ?? []).map((s) => ({
        title: s.title,
        description: s.description ?? "",
        deadline: s.deadline ?? null,
        priority: (s.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
        selected: true,
      }));
      setSuggestions(items);
    } catch {
      setError("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSelected() {
    const toAdd = suggestions.filter((s) => s.selected);
    if (toAdd.length === 0) return;
    setAddingTasks(true);
    setError("");

    try {
      for (const s of toAdd) {
        await createTask.mutateAsync({
          data: {
            title: s.title,
            description: s.description || undefined,
            priority: s.priority,
            status: "TODO",
            deadline: s.deadline || undefined,
          },
        });
      }
      await qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
      await qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setSuccessMsg(`${toAdd.length} task${toAdd.length !== 1 ? "s" : ""} added to your task list!`);
      setSuggestions([]);
      setGoal("");
      setTargetDate("");
      onTasksAdded();
    } catch {
      setError("Failed to add tasks. Please try again.");
    } finally {
      setAddingTasks(false);
    }
  }

  function toggleSuggestion(i: number) {
    setSuggestions((prev) => prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s));
  }

  const selectedCount = suggestions.filter((s) => s.selected).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center">
          <Bot className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">AI Habit Helper</h3>
          <p className="text-xs text-slate-400">Describe your goal — get a ready-to-use task plan</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ai-goal">Your goal</Label>
          <Textarea
            id="ai-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Run my first 5K in 8 weeks, learn Spanish basics, read 12 books this year…"
            rows={2}
            className="resize-none"
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleSuggest(); }}
          />
        </div>

        <div className="flex gap-3 items-end">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="ai-date">Target date (optional)</Label>
            <Input
              id="ai-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSuggest}
            disabled={!goal.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 shrink-0"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Suggest Tasks
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-3 rounded-xl text-sm font-medium">
          <Zap className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              AI Suggestions — select what to add
            </p>
            <button
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
              onClick={() => setSuggestions((prev) => {
                const allSelected = prev.every((s) => s.selected);
                return prev.map((s) => ({ ...s, selected: !allSelected }));
              })}
            >
              {suggestions.every((s) => s.selected) ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => toggleSuggestion(i)}
                className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                  s.selected
                    ? "border-violet-200 bg-violet-50"
                    : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                <div className="mt-0.5 shrink-0 text-violet-500">
                  {s.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-medium text-sm text-slate-800">{s.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${PRIORITY_STYLES[s.priority] ?? ""}`}>
                      <Flag className="w-2.5 h-2.5" />
                      {s.priority.charAt(0) + s.priority.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                  )}
                  {s.deadline && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <CalendarDays className="w-3 h-3" /> {s.deadline}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleAddSelected}
            disabled={selectedCount === 0 || addingTasks}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            {addingTasks ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add {selectedCount} selected task{selectedCount !== 1 ? "s" : ""} to my list
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface HabitsTabProps {
  onToast: (msg: string) => void;
}

function computeStreak(tasks: { habitId?: number | null; status: string; deadline?: string | null }[]): number {
  const doneDates = new Set(
    tasks
      .filter((t) => t.habitId != null && t.status === "DONE" && t.deadline)
      .map((t) => t.deadline!),
  );
  let streak = 0;
  const base = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    if (doneDates.has(d.toISOString().split("T")[0])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function HabitsTab({ onToast }: HabitsTabProps) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [generating, setGenerating] = useState(false);
  const [justCreatedHabit, setJustCreatedHabit] = useState(false);
  const justCreatedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: habits = [], isLoading } = useGetHabits();
  const { data: classifications = [] } = useGetClassifications();
  const { data: tasks = [] } = useGetTasks();

  const allHabits = habits as Habit[];
  const allClassifications = classifications as Classification[];
  const allTasks = tasks as { habitId?: number | null; status: string; deadline?: string | null }[];

  const today = new Date().toISOString().split("T")[0];
  const todayHabitTasks = allTasks.filter((t) => t.habitId != null && t.deadline === today);
  const completedHabits = todayHabitTasks.filter((t) => t.status === "DONE").length;
  const totalHabits = allHabits.filter((h) => h.isActive).length;
  const productivityScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const currentStreak = computeStreak(allTasks);

  useEffect(() => {
    return () => { if (justCreatedTimer.current) clearTimeout(justCreatedTimer.current); };
  }, []);

  const deleteHabit = useDeleteHabit({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetHabitsQueryKey() });
        setDeletingHabit(null);
      },
    },
  });

  const generateToday = useGenerateTodayHabitTasks();

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateToday.mutateAsync();
      await qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
      await qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      const r = result as { generated: number; skipped: number };
      if (r.generated === 0) {
        onToast(r.skipped > 0 ? `All ${r.skipped} habit tasks already exist for today` : "No active habits to generate tasks from");
      } else {
        onToast(`Generated ${r.generated} habit task${r.generated !== 1 ? "s" : ""} for today${r.skipped > 0 ? ` (${r.skipped} already existed)` : ""}`);
      }
    } catch {
      onToast("Failed to generate habit tasks");
    } finally {
      setGenerating(false);
    }
  }

  function handleHabitCreated() {
    setJustCreatedHabit(true);
    if (justCreatedTimer.current) clearTimeout(justCreatedTimer.current);
    justCreatedTimer.current = setTimeout(() => setJustCreatedHabit(false), 4000);
  }

  const activeCount = allHabits.filter((h) => h.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800 text-base">My Habits</h2>
          {allHabits.length > 0 && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full font-medium">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating || activeCount === 0}
            className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-40 border border-teal-200"
          >
            {generating ? (
              <span className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Generate Today's Tasks
          </button>
          <button
            onClick={() => { setEditingHabit(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" /> New Habit
          </button>
        </div>
      </div>

      {/* Habit list */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
      ) : allHabits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-4xl mb-3">🔄</p>
          <p className="font-medium text-slate-700">No habits yet</p>
          <p className="text-sm text-slate-400 mt-1">Create your first daily habit to build consistency</p>
          <button
            onClick={() => { setEditingHabit(null); setFormOpen(true); }}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Create a habit
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {allHabits.map((habit) => {
            const cls = allClassifications.find((c) => c.id === habit.classificationId);
            return (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-3 group transition-opacity ${habit.isActive ? "border-slate-100" : "border-slate-100 opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${habit.isActive ? "bg-teal-400" : "bg-slate-300"}`} />
                      <h4 className="font-semibold text-slate-800 text-sm leading-snug">{habit.title}</h4>
                    </div>
                    {habit.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingHabit(habit); setFormOpen(true); }}
                      className="text-slate-300 hover:text-teal-500 p-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingHabit(habit)}
                      className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[habit.priority] ?? ""}`}>
                    <Flag className="w-2.5 h-2.5" />
                    {habit.priority.charAt(0) + habit.priority.slice(1).toLowerCase()}
                  </span>
                  {cls && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{cls.name}</span>
                  )}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${habit.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    {habit.isActive ? "Active" : "Paused"}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <CalendarDays className="w-3 h-3" /> since {habit.startDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Habit Helper */}
      <AiHabitHelper onTasksAdded={() => onToast("Tasks added to your list!")} />

      {/* Habit Helper Widget */}
      <div className="flex justify-end">
        <HabitHelper
          currentStreak={currentStreak}
          completedHabits={completedHabits}
          totalHabits={totalHabits}
          productivityScore={productivityScore}
          justCreatedHabit={justCreatedHabit}
        />
      </div>

      {/* Form Dialog */}
      <HabitFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingHabit(null); }}
        editHabit={editingHabit}
        classifications={allClassifications}
        onCreated={handleHabitCreated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingHabit} onOpenChange={(open) => { if (!open) setDeletingHabit(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingHabit?.title}" will be permanently deleted. Tasks already generated from this habit will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deletingHabit) deleteHabit.mutate({ habitId: deletingHabit.id }); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
