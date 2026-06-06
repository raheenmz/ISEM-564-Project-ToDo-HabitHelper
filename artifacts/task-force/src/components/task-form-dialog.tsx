import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateTask,
  useUpdateTask,
  useGetClassifications,
  useCreateClassification,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetClassificationsQueryKey,
} from "@workspace/api-client-react";
import type { Task, Classification } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const NO_CATEGORY = "__none__";
const ADD_CATEGORY = "__new__";

export function TaskFormDialog({ open, onClose, editTask }: TaskFormDialogProps) {
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [deadline, setDeadline] = useState("");
  const [classificationId, setClassificationId] = useState<string>("");
  const [newClassifName, setNewClassifName] = useState("");
  const [showNewClassif, setShowNewClassif] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: classifications = [] } = useGetClassifications();

  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        onClose();
      },
      onError: () => setFormError("Failed to save task. Please try again."),
    },
  });

  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        onClose();
      },
      onError: () => setFormError("Failed to update task. Please try again."),
    },
  });

  const createClassification = useCreateClassification({
    mutation: {
      onSuccess: (created: Classification) => {
        qc.invalidateQueries({ queryKey: getGetClassificationsQueryKey() });
        setClassificationId(String(created.id));
        setNewClassifName("");
        setShowNewClassif(false);
      },
    },
  });

  useEffect(() => {
    if (open) {
      setFormError("");
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description ?? "");
        setPriority(editTask.priority as "LOW" | "MEDIUM" | "HIGH");
        setStatus(editTask.status as "TODO" | "IN_PROGRESS" | "DONE");
        setDeadline(editTask.deadline ?? "");
        setClassificationId(editTask.classificationId ? String(editTask.classificationId) : "");
      } else {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setStatus("TODO");
        setDeadline("");
        setClassificationId("");
      }
      setNewClassifName("");
      setShowNewClassif(false);
    }
  }, [open, editTask]);

  function handleCategoryChange(v: string) {
    if (v === ADD_CATEGORY) {
      setShowNewClassif(true);
    } else if (v === NO_CATEGORY) {
      setClassificationId("");
      setShowNewClassif(false);
    } else {
      setClassificationId(v);
      setShowNewClassif(false);
    }
  }

  function handleAddClassification() {
    const name = newClassifName.trim();
    if (!name) return;
    createClassification.mutate({ data: { name } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: status as "TODO" | "IN_PROGRESS" | "DONE",
      deadline: deadline || undefined,
      classificationId: classificationId ? Number(classificationId) : undefined,
    };

    if (editTask) {
      updateTask.mutate({ id: editTask.id, data: payload });
    } else {
      createTask.mutate({ data: payload });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;
  const selectValue = classificationId || NO_CATEGORY;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTask ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "TODO" | "IN_PROGRESS" | "DONE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={selectValue} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>None</SelectItem>
                  {(classifications as Classification[]).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={ADD_CATEGORY} className="text-primary font-medium">
                    + Add category…
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showNewClassif && (
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="new-classif">New category name</Label>
                <Input
                  id="new-classif"
                  value={newClassifName}
                  onChange={(e) => setNewClassifName(e.target.value)}
                  placeholder="e.g. Fitness"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddClassification(); }}}
                  autoFocus
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddClassification}
                disabled={!newClassifName.trim() || createClassification.isPending}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewClassif(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {formError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{formError}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editTask ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
