export type GroupEventType =
  | "group:created"
  | "group:deleted"
  | "member:added"
  | "member:removed"
  | "task:created"
  | "task:updated"
  | "task:deleted";

export interface GroupEvent {
  type: GroupEventType;
  groupId: number;
}

export interface HabitProgressEvent {
  type: "habit:progress_updated";
  userId: number;
}

type WriteFn = (chunk: string) => boolean;

interface Subscriber {
  userId: number;
  write: WriteFn;
  channel: "groups" | "habits";
}

const subscribers = new Set<Subscriber>();

export function addSubscriber(userId: number, write: WriteFn, channel: "groups" | "habits" = "groups"): () => void {
  const sub: Subscriber = { userId, write, channel };
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}

export function emitGroupEvent(event: GroupEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const sub of subscribers) {
    if (sub.channel !== "groups") continue;
    try {
      sub.write(payload);
    } catch {
    }
  }
}

export function emitHabitProgressEvent(userId: number): void {
  const event: HabitProgressEvent = { type: "habit:progress_updated", userId };
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const sub of subscribers) {
    if (sub.channel !== "habits" || sub.userId !== userId) continue;
    try {
      sub.write(payload);
    } catch {
    }
  }
}
