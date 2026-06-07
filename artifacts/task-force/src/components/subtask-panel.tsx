import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  getGetSubtasksQueryKey,
} from "@workspace/api-client-react";
import type { Subtask } from "@workspace/api-client-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface SubtaskPanelProps {
  taskId: number;
  onAllCompleted?: () => void;
}

export function SubtaskPanel({ taskId, onAllCompleted }: SubtaskPanelProps) {
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: subtasks = [], isLoading } = useGetSubtasks(taskId);

  const createSubtask = useCreateSubtask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSubtasksQueryKey(taskId) });
        setNewTitle("");
        setAddingNew(false);
      },
    },
  });

  const updateSubtask = useUpdateSubtask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSubtasksQueryKey(taskId) });
      },
    },
  });

  const deleteSubtask = useDeleteSubtask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSubtasksQueryKey(taskId) });
      },
    },
  });

  const allSubtasks = subtasks as Subtask[];
  const completedCount = allSubtasks.filter((s) => s.completed).length;
  const totalCount = allSubtasks.length;

  useEffect(() => {
    if (totalCount > 0 && completedCount === totalCount) {
      onAllCompleted?.();
    }
  }, [completedCount, totalCount, onAllCompleted]);

  useEffect(() => {
    if (addingNew) {
      inputRef.current?.focus();
    }
  }, [addingNew]);

  function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    createSubtask.mutate({ id: taskId, data: { title } });
  }

  function handleToggle(s: Subtask) {
    updateSubtask.mutate({ id: taskId, subtaskId: s.id, data: { completed: !s.completed } });
  }

  function handleDelete(s: Subtask) {
    deleteSubtask.mutate({ id: taskId, subtaskId: s.id });
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Subtasks</span>
          {totalCount > 0 && (
            <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {!addingNew && (
          <button
            type="button"
            onClick={() => setAddingNew(true)}
            className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-0.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* All complete notice */}
      {totalCount > 0 && completedCount === totalCount && (
        <div className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 font-medium">
          All subtasks complete — consider marking this task as Done!
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-7 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {allSubtasks.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 group rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors"
            >
              <Checkbox
                id={`subtask-${s.id}`}
                checked={s.completed}
                onCheckedChange={() => handleToggle(s)}
                className="shrink-0"
              />
              <label
                htmlFor={`subtask-${s.id}`}
                className={`flex-1 text-sm cursor-pointer select-none ${s.completed ? "line-through text-slate-400" : "text-slate-700"}`}
              >
                {s.title}
              </label>
              <button
                type="button"
                onClick={() => handleDelete(s)}
                disabled={deleteSubtask.isPending}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all disabled:opacity-50"
                aria-label="Delete subtask"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {allSubtasks.length === 0 && !addingNew && (
            <p className="text-xs text-slate-400 px-2 py-1">
              No subtasks yet. Break this task into smaller steps.
            </p>
          )}
        </div>
      )}

      {/* New subtask input */}
      {addingNew && (
        <div className="flex items-center gap-2 mt-1">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title…"
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
              if (e.key === "Escape") { setAddingNew(false); setNewTitle(""); }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!newTitle.trim() || createSubtask.isPending}
            className="h-8 px-3 shrink-0"
          >
            {createSubtask.isPending ? "…" : "Add"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 shrink-0"
            onClick={() => { setAddingNew(false); setNewTitle(""); }}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}
