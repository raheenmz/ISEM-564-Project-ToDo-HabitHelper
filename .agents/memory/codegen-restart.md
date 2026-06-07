---
name: Codegen restart rule
description: After running orval codegen, the task-force Vite dev server must be restarted or HMR breaks
---

After any `pnpm --filter @workspace/api-spec run codegen` run, restart the `artifacts/task-force: web` workflow.

**Why:** Orval cleans the output folder before regenerating. While files are briefly deleted, Vite's HMR loses track of them and throws "Failed to reload" errors even after the files come back. A full restart clears the module graph.

**How to apply:** Any time you run codegen (adding/changing openapi.yaml and running orval), immediately follow with `restart_workflow("artifacts/task-force: web")`.
