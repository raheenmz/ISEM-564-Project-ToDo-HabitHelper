import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetTasks,
  useDeleteTask,
  useUpdateTask,
  useGetDashboardSummary,
  useGetGroups,
  useDeleteGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useCreateGroupNote,
  useDeleteGroupNote,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetGroupsQueryKey,
} from "@workspace/api-client-react";
import type { Task, Group, GroupMember } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { CreateGroupDialog } from "@/components/create-group-dialog";
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
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock,
  Flag,
  LayoutGrid,
  List,
  ListTodo,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Users,
  UserPlus,
  X,
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}-${MONTHS[parseInt(m, 10) - 1]}-${y}`;
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
      title={onClick ? "Click to advance status" : undefined}
    >
      {STATUS_LABELS[status] ?? status}
    </button>
  );
}

/* ── Focus card ── */
function FocusCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task; onEdit: (t: Task) => void; onDelete: (t: Task) => void; onStatusChange: (t: Task, s: string) => void;
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
          <CalendarDays className="w-3 h-3" /> {fmtDate(task.deadline)}
        </div>
      )}
    </div>
  );
}

/* ── Kanban card ── */
function KanbanCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task; onEdit: (t: Task) => void; onDelete: (t: Task) => void; onStatusChange: (t: Task, s: string) => void;
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
            <CalendarDays className="w-3 h-3" /> {fmtDate(task.deadline)}
          </div>
        ) : <span />}
        <StatusPill status={task.status} onClick={() => onStatusChange(task, NEXT_STATUS[task.status] ?? "TODO")} />
      </div>
    </div>
  );
}

/* ── Stat tile ── */
function StatTile({ label, value, bg, textColor, icon }: {
  label: string; value: number; bg: string; textColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`${bg} rounded-3xl p-6 flex flex-col justify-between shadow-sm`} style={{ minHeight: "9rem" }}>
      <div className="bg-white/50 w-11 h-11 rounded-full flex items-center justify-center mb-3">{icon}</div>
      <div>
        <p className={`${textColor} font-medium text-sm mb-1 opacity-80`}>{label}</p>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ── Group card ── */
function GroupCard({ group, currentUserId, allTasks, onDelete, onEdit, onAddMember, onRemoveMember, onEditGroupTask }: {
  group: Group;
  currentUserId: number;
  allTasks: Task[];
  onDelete: (id: number) => void;
  onEdit: (group: Group) => void;
  onAddMember: (groupId: number, name: string) => void;
  onRemoveMember: (groupId: number, memberId: number) => void;
  onEditGroupTask: (task: Task, members: GroupMember[]) => void;
}) {
  const qc = useQueryClient();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [noteText, setNoteText] = useState("");
  const [postingNote, setPostingNote] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  const createNote = useCreateGroupNote();
  const deleteNote = useDeleteGroupNote();
  const updateGroupTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    },
  });

  const isCreator = group.createdBy === currentUserId;
  const groupColor = group.color || "#14b8a6";
  const notes = group.notes ?? [];

  const sortedNotes = [...notes].reverse();
  const noteGroups: { authorId: number; authorName: string; items: typeof sortedNotes }[] = [];
  sortedNotes.forEach((n) => {
    const last = noteGroups[noteGroups.length - 1];
    if (last && last.authorId === n.authorId) {
      last.items.push(n);
    } else {
      noteGroups.push({ authorId: n.authorId, authorName: n.authorName, items: [n] });
    }
  });

  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [notes.length]);

  const total = group.tasks.length;
  const done = group.tasks.filter((t) => t.status === "DONE").length;
  const inProgress = group.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = group.tasks.filter((t) => t.status === "TODO").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;


  function handleAdd() {
    const query = emailInput.trim() || nameInput.trim();
    if (!query) return;
    onAddMember(group.id, query);
    setNameInput("");
    setEmailInput("");
  }

  async function handlePostNote() {
    if (!noteText.trim() || !currentUserId) return;
    setPostingNote(true);
    try {
      await createNote.mutateAsync({ id: group.id, data: { noteText: noteText.trim(), authorId: currentUserId } });
      await qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
      setNoteText("");
    } catch { /* ignore */ } finally {
      setPostingNote(false);
    }
  }

  async function handleDeleteNote(noteId: number) {
    try {
      await deleteNote.mutateAsync({ id: group.id, noteId });
      await qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
    } catch { /* ignore */ }
  }

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6"
      style={{ borderTop: `4px solid ${groupColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: groupColor + "22" }}
          >
            <Users className="w-5 h-5" style={{ color: groupColor }} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{group.name}</h3>
            <p className="text-xs text-slate-400">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isCreator && (
            <button
              onClick={() => onEdit(group)}
              className="text-slate-300 hover:text-teal-500 transition-colors p-1.5 rounded-lg hover:bg-teal-50"
              title="Edit group"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {isCreator && (
            <button
              onClick={() => onDelete(group.id)}
              className="text-slate-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title="Delete group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Members</p>
        <div className="flex flex-wrap gap-2">
          {group.members.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-full">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: groupColor }}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              {m.name}
              {isCreator && m.userId !== group.createdBy && (
                <button
                  onClick={() => onRemoveMember(group.id, m.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors leading-none ml-0.5"
                  title={`Remove ${m.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder="Name…"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition placeholder:text-slate-300"
          />
          <input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder="Email…"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition placeholder:text-slate-300"
          />
          <button
            onClick={handleAdd}
            disabled={!nameInput.trim() && !emailInput.trim()}
            className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Tasks
          {group.tasks.length > 0 && (
            <span className="ml-1.5 font-bold" style={{ color: groupColor }}>{group.tasks.length}</span>
          )}
        </p>
        {group.tasks.length === 0 ? (
          <p className="text-xs text-slate-300 italic py-1">No tasks assigned to this group yet</p>
        ) : (
          <div className="space-y-1.5">
            {group.tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl group/task">
                <PriorityPill priority={t.priority} />
                <span className={`text-sm flex-1 min-w-0 truncate font-medium ${t.status === "DONE" ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {t.title}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 hidden sm:block">
                  {t.assigneeName ? `→ ${t.assigneeName}` : "Unassigned"}
                </span>
                <select
                  value={t.status}
                  onChange={(e) => updateGroupTask.mutate({ id: t.id, data: { status: e.target.value as "TODO" | "IN_PROGRESS" | "DONE" } })}
                  className="text-xs px-2 py-0.5 rounded-full font-medium border-0 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer shrink-0"
                  style={{
                    backgroundColor:
                      t.status === "DONE" ? "#f0fdf4" :
                      t.status === "IN_PROGRESS" ? "#f0f9ff" :
                      "#f1f5f9",
                    color:
                      t.status === "DONE" ? "#4d7c0f" :
                      t.status === "IN_PROGRESS" ? "#0369a1" :
                      "#475569",
                  }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <button
                  onClick={() => {
                    const full = allTasks.find((at) => at.id === t.id);
                    if (full) onEditGroupTask(full, group.members as GroupMember[]);
                  }}
                  className="opacity-0 group-hover/task:opacity-100 transition-opacity text-slate-300 hover:text-teal-500 p-1 rounded-lg hover:bg-teal-50 shrink-0"
                  title="Edit task"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Progress</p>
          <span className="text-xs font-bold" style={{ color: groupColor }}>{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: groupColor }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {done} of {total} task{total !== 1 ? "s" : ""} completed
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            To Do <strong>{todo}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            In Progress <strong>{inProgress}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-lime-50 text-lime-700 px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            Done <strong>{done}</strong>
          </span>
        </div>
      </div>

      {/* Discussion board */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Discussion</p>

        {/* Message feed — oldest at top, newest at bottom */}
        {sortedNotes.length === 0 ? (
          <p className="text-xs text-slate-300 italic py-2 text-center">No messages yet — start the conversation</p>
        ) : (
          <div className="max-h-60 overflow-y-auto flex flex-col gap-3 pr-1">
            {noteGroups.map((grp, gi) => (
              <div key={`${grp.authorId}-${gi}`} className="flex gap-2.5 items-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: groupColor }}
                >
                  {grp.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">{grp.authorName}</span>
                    <span className="text-[10px] text-slate-400">{fmtDateTime(grp.items[0].createdAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {grp.items.map((n) => (
                      <div key={n.id} className="group/msg flex items-start gap-1.5">
                        <p className="flex-1 text-sm text-slate-600 leading-relaxed break-words bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2">
                          {n.noteText}
                        </p>
                        {n.authorId === currentUserId && (
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-slate-300 hover:text-red-400 mt-2 shrink-0"
                            title="Delete message"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={notesEndRef} />
          </div>
        )}

        {/* Input area — always at bottom */}
        <div className="flex gap-2 items-end pt-1 border-t border-slate-100">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostNote(); } }}
            placeholder="Type a message… (Enter to send)"
            rows={2}
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition placeholder:text-slate-300 resize-none"
          />
          <button
            onClick={handlePostNote}
            disabled={!noteText.trim() || postingNote}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 self-end mb-px"
          >
            {postingNote ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><MessageSquare className="w-3.5 h-3.5" /> Send</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ Dashboard ══════════════════════════════════════════════════ */
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout, isLoggingOut } = useAuth();
  const qc = useQueryClient();

  const [activeSection, setActiveSection] = useState<"tasks" | "groups">("tasks");
  const [activeTab, setActiveTab] = useState<"list" | "kanban">("list");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupTaskFormOpen, setGroupTaskFormOpen] = useState(false);
  const [editingGroupTask, setEditingGroupTask] = useState<Task | null>(null);
  const [editingGroupTaskMembers, setEditingGroupTaskMembers] = useState<GroupMember[]>([]);
  const [overdueBannerDismissed, setOverdueBannerDismissed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE">("ALL");

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: summary } = useGetDashboardSummary();
  const { data: groups = [], isLoading: groupsLoading } = useGetGroups();

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

  const deleteGroup = useDeleteGroup({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() }),
    },
  });

  const addMember = useAddGroupMember({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() }),
      onError: () => {},
    },
  });

  const removeMember = useRemoveGroupMember({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() }),
    },
  });

  const today = todayStr();
  const quote = getQuote();
  const allTasks = tasks as Task[];
  const allGroups = groups as Group[];

  const todayTasks      = useMemo(() => sortTasks(allTasks.filter((t) => t.deadline === today && t.status !== "DONE")), [allTasks, today]);
  const todoTasks       = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "TODO")), [allTasks]);
  const inProgressTasks = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "IN_PROGRESS")), [allTasks]);
  const doneTasks       = useMemo(() => sortTasks(allTasks.filter((t) => t.status === "DONE")), [allTasks]);
  const overdueTasks    = useMemo(() => sortTasks(allTasks.filter((t) => t.isOverdue)), [allTasks]);
  const sortedTasks     = useMemo(() => sortTasks(allTasks), [allTasks]);
  const filteredTasks   = useMemo(() => {
    if (statusFilter === "ALL") return sortedTasks;
    if (statusFilter === "OVERDUE") return overdueTasks;
    return sortTasks(allTasks.filter((t) => t.status === statusFilter));
  }, [statusFilter, sortedTasks, overdueTasks, allTasks]);

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

  function handleDeleteGroup(id: number) {
    deleteGroup.mutate({ id });
  }

  function handleEditGroup(group: Group) {
    setEditingGroup(group);
    setCreateGroupOpen(true);
  }

  function handleEditGroupTask(task: Task, members: GroupMember[]) {
    setEditingGroupTask(task);
    setEditingGroupTaskMembers(members);
    setGroupTaskFormOpen(true);
  }

  function handleAddMember(groupId: number, memberName: string) {
    addMember.mutate({ id: groupId, data: { memberName } });
  }

  function handleRemoveMember(groupId: number, memberId: number) {
    removeMember.mutate({ id: groupId, memberId });
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Jarvis</span>
          </div>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
            <button
              onClick={() => setActiveSection("tasks")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${activeSection === "tasks" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <ListTodo className="w-4 h-4" /> Tasks
            </button>
            <button
              onClick={() => setActiveSection("groups")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${activeSection === "groups" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users className="w-4 h-4" /> Groups
              {allGroups.length > 0 && (
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{allGroups.length}</span>
              )}
            </button>
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

        {/* ── Overdue Alert Banner ── */}
        {!overdueBannerDismissed && overdueTasks.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""}</span>
              <span className="text-amber-700 ml-1.5 text-sm">— these tasks are past their deadline and still open.</span>
            </div>
            <button
              onClick={() => { setStatusFilter("OVERDUE"); setActiveSection("tasks"); }}
              className="text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0"
            >
              View overdue
            </button>
            <button
              onClick={() => setOverdueBannerDismissed(true)}
              className="text-amber-400 hover:text-amber-700 transition-colors shrink-0 ml-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ════ TASKS SECTION ════ */}
        {activeSection === "tasks" && (
          <>
            {/* Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
              <StatTile label="Overdue" value={overdueTasks.length}
                bg="bg-amber-100" textColor="text-amber-900"
                icon={<AlertTriangle className="w-5 h-5 text-amber-800" />} />
            </div>

            {/* Today's Focus */}
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

            {/* All Tasks */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-slate-800 text-base">All Tasks</h2>
                  {/* Filter chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(["ALL", "TODO", "IN_PROGRESS", "DONE", "OVERDUE"] as const).map((f) => {
                      const labels: Record<typeof f, string> = { ALL: "All", TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done", OVERDUE: "Overdue" };
                      const active = statusFilter === f;
                      const isOverdue = f === "OVERDUE";
                      return (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                            active
                              ? isOverdue
                                ? "bg-amber-500 text-white"
                                : "bg-teal-600 text-white"
                              : isOverdue
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {labels[f]}
                          {isOverdue && overdueTasks.length > 0 && (
                            <span className={`ml-0.5 font-bold ${active ? "text-white" : "text-amber-600"}`}>{overdueTasks.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-100 shrink-0">
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
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-4xl mb-3">{statusFilter === "OVERDUE" ? "✅" : "📋"}</p>
                    <p className="font-medium text-slate-700">
                      {statusFilter === "OVERDUE" ? "No overdue tasks" : statusFilter === "ALL" ? "No tasks yet" : `No ${STATUS_LABELS[statusFilter] ?? statusFilter} tasks`}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {statusFilter === "OVERDUE" ? "You're all caught up!" : statusFilter === "ALL" ? "Create your first task to get started" : ""}
                    </p>
                    {statusFilter === "ALL" && (
                      <button onClick={openCreate} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
                        Create a task
                      </button>
                    )}
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
                        {filteredTasks.map((t) => (
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
                                ? <span className={`text-xs whitespace-nowrap ${t.isOverdue ? "text-amber-600 font-medium" : "text-slate-400"}`}>{fmtDate(t.deadline)}</span>
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
                      { status: "TODO",        label: "To Do",       tasks: (statusFilter === "ALL" ? todoTasks : filteredTasks.filter(t => t.status === "TODO")),             dot: "bg-orange-400", count: "bg-orange-100 text-orange-700" },
                      { status: "IN_PROGRESS", label: "In Progress", tasks: (statusFilter === "ALL" ? inProgressTasks : filteredTasks.filter(t => t.status === "IN_PROGRESS")), dot: "bg-sky-400",    count: "bg-sky-100 text-sky-700"    },
                      { status: "DONE",        label: "Done",        tasks: (statusFilter === "ALL" ? doneTasks : filteredTasks.filter(t => t.status === "DONE")),             dot: "bg-lime-500",   count: "bg-lime-100 text-lime-700"   },
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
          </>
        )}

        {/* ════ GROUPS SECTION ════ */}
        {activeSection === "groups" && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Groups</h2>
                <p className="text-sm text-slate-400">Collaborate with your team by organising tasks into groups</p>
              </div>

              <button
                onClick={() => setCreateGroupOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-1.5 text-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Create Group
              </button>
            </div>

            {groupsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)}
              </div>
            ) : allGroups.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-400" />
                </div>
                <p className="font-semibold text-slate-700 text-lg">No groups yet</p>
                <p className="text-sm text-slate-400 mt-1">Create your first group to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allGroups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    currentUserId={user.id}
                    allTasks={allTasks}
                    onDelete={handleDeleteGroup}
                    onEdit={handleEditGroup}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                    onEditGroupTask={handleEditGroupTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Task Form */}
      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        editTask={editingTask}
      />

      {/* Group Task Edit Form */}
      <TaskFormDialog
        open={groupTaskFormOpen}
        onClose={() => { setGroupTaskFormOpen(false); setEditingGroupTask(null); setEditingGroupTaskMembers([]); }}
        editTask={editingGroupTask}
        groupMembers={editingGroupTaskMembers}
      />

      {/* Create / Edit Group Modal */}
      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => { setCreateGroupOpen(false); setEditingGroup(null); }}
        editGroup={editingGroup}
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
