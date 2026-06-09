import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetHabitTodayProgressQueryKey,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";

export function useHabitProgressEvents(enabled = true) {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function connect() {
      const es = new EventSource("/api/habits/progress-events", { withCredentials: true });
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const event = JSON.parse(ev.data);
          if (event.type === "habit:progress_updated") {
            qc.invalidateQueries({ queryKey: getGetHabitTodayProgressQueryKey() });
            qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
            qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
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
