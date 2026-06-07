---
name: Group task editing pattern
description: How TaskFormDialog supports group-context editing with member-filtered assignee dropdown
---

`TaskFormDialog` accepts an optional `groupMembers?: { userId: number; name: string }[]` prop.

**Why:** When editing a task from within a GroupCard, only that group's members should appear in the "Assigned to" dropdown. Passing `groupMembers` also hides the "Assign to Group" select (since the group is already known) and shows "Assigned to" member select instead.

**How to apply:**
- In Dashboard, call `setEditingGroupTask(fullTask)` + `setEditingGroupTaskMembers(group.members)` + open `groupTaskFormOpen`
- Render a second `<TaskFormDialog groupMembers={editingGroupTaskMembers} />` alongside the regular one
- GroupCard must receive `allTasks: Task[]` and `onEditGroupTask` props so it can look up the full Task by id (GroupTask lacks description/deadline/classificationId)
- `assignedUserId` is now part of GroupTask (added to OpenAPI), so group task rows can show assignee name without additional lookups
