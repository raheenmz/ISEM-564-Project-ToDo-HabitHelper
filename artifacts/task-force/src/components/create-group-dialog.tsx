import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateGroup,
  useUpdateGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  getGetGroupsQueryKey,
} from "@workspace/api-client-react";
import type { Group } from "@workspace/api-client-react";
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
import { Plus, X } from "lucide-react";

const GROUP_COLORS = [
  { name: "Teal",   hex: "#14b8a6" },
  { name: "Blue",   hex: "#3b82f6" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Pink",   hex: "#ec4899" },
  { name: "Orange", hex: "#f97316" },
  { name: "Lime",   hex: "#84cc16" },
  { name: "Red",    hex: "#ef4444" },
  { name: "Yellow", hex: "#eab308" },
];

interface MemberRow { name: string; email: string; }

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  editGroup?: Group | null;
}

export function CreateGroupDialog({ open, onClose, editGroup }: CreateGroupDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!editGroup;

  const [groupName, setGroupName] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0].hex);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [removedMemberIds, setRemovedMemberIds] = useState<number[]>([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const addMember = useAddGroupMember();
  const removeMember = useRemoveGroupMember();

  useEffect(() => {
    if (open && editGroup) {
      setGroupName(editGroup.name);
      setColor(editGroup.color ?? GROUP_COLORS[0].hex);
      setMemberRows([]);
      setRemovedMemberIds([]);
      setFormError("");
      setSaving(false);
    } else if (open && !editGroup) {
      setGroupName("");
      setColor(GROUP_COLORS[0].hex);
      setMemberRows([]);
      setRemovedMemberIds([]);
      setFormError("");
      setSaving(false);
    }
  }, [open, editGroup]);

  function handleClose() {
    onClose();
  }

  function addRow() {
    setMemberRows((prev) => [...prev, { name: "", email: "" }]);
  }

  function removeRow(i: number) {
    setMemberRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof MemberRow, value: string) {
    setMemberRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  }

  function toggleRemoveExistingMember(memberId: number) {
    setRemovedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) {
      setFormError("Group name is required.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      let groupId: number;

      if (isEdit && editGroup) {
        await updateGroup.mutateAsync({ id: editGroup.id, data: { name, color } });
        groupId = editGroup.id;

        for (const memberId of removedMemberIds) {
          try {
            await removeMember.mutateAsync({ id: groupId, memberId });
          } catch { /* skip */ }
        }
      } else {
        const newGroup = await createGroup.mutateAsync({ data: { name, color } });
        groupId = newGroup.id;
      }

      for (const row of memberRows) {
        const query = row.email.trim() || row.name.trim();
        if (!query) continue;
        try {
          await addMember.mutateAsync({ id: groupId, data: { memberName: query } });
        } catch { /* skip members that can't be found */ }
      }

      await qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
      handleClose();
    } catch {
      setFormError(
        isEdit ? "Failed to update group. Please try again." : "Failed to create group. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const existingMembers = editGroup?.members ?? [];
  const creatorId = editGroup?.createdBy;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Group" : "New Group"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Marketing Team"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Group Color</Label>
            <div className="flex flex-wrap gap-2.5 pt-0.5">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none flex-shrink-0"
                  style={{
                    backgroundColor: c.hex,
                    boxShadow:
                      color === c.hex
                        ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                        : "none",
                    transform: color === c.hex ? "scale(1.2)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>

            {isEdit && existingMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {existingMembers.map((m) => {
                  const isCreator = m.userId === creatorId;
                  const isRemoved = removedMemberIds.includes(m.id);
                  return (
                    <span
                      key={m.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        isRemoved
                          ? "bg-red-50 border-red-200 text-red-400 line-through"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {m.name}
                      {!isCreator && (
                        <button
                          type="button"
                          onClick={() => toggleRemoveExistingMember(m.id)}
                          className={`transition-colors leading-none ${
                            isRemoved ? "text-red-300 hover:text-red-500" : "text-slate-300 hover:text-red-400"
                          }`}
                          title={isRemoved ? "Undo remove" : `Remove ${m.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {memberRows.length === 0 && !isEdit && (
              <p className="text-xs text-muted-foreground py-1">
                No members added yet. Click below to invite teammates.
              </p>
            )}

            {memberRows.length > 0 && (
              <div className="space-y-2">
                {memberRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      value={row.email}
                      onChange={(e) => updateRow(i, "email", e.target.value)}
                      placeholder="Email"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded flex-shrink-0"
                      title="Remove member"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="w-full"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Member
            </Button>
          </div>

          {formError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Save Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
