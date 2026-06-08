import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetGroupsQueryKey,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";

interface GroupEvent {
  type:
    | "group:created"
    | "group:deleted"
    | "member:added"
    | "member:removed"
    | "task:created"
    | "task:updated"
    | "task:deleted";
  groupId: number;
}

export function useGroupEvents(enabled = true) {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function connect() {
      const es = new EventSource("/api/groups/events", { withCredentials: true });
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const event: GroupEvent = JSON.parse(ev.data);

          switch (event.type) {
            case "group:created":
            case "group:deleted":
            case "member:added":
            case "member:removed":
              qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
              break;
            case "task:created":
            case "task:updated":
            case "task:deleted":
              qc.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
              qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
              qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
              break;
          }
        } catch {
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, qc]);
}
