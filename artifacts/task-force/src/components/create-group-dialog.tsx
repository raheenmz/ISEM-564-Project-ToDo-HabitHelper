import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateGroup,
  useAddGroupMember,
  getGetGroupsQueryKey,
} from "@workspace/api-client-react";
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
}

export function CreateGroupDialog({ open, onClose }: CreateGroupDialogProps) {
  const qc = useQueryClient();
  const [groupName, setGroupName] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0].hex);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const createGroup = useCreateGroup();
  const addMember = useAddGroupMember();

  function resetForm() {
    setGroupName("");
    setColor(GROUP_COLORS[0].hex);
    setMemberRows([]);
    setFormError("");
    setSaving(false);
  }

  function handleClose() {
    resetForm();
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
      const newGroup = await createGroup.mutateAsync({ data: { name, color } });
      for (const row of memberRows) {
        const query = row.email.trim() || row.name.trim();
        if (!query) continue;
        try {
          await addMember.mutateAsync({ id: newGroup.id, data: { memberName: query } });
        } catch {
          /* skip members that can't be found */
        }
      }
      await qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
      handleClose();
    } catch {
      setFormError("Failed to create group. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
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
            {memberRows.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                No members added yet. Click below to invite teammates.
              </p>
            ) : (
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
