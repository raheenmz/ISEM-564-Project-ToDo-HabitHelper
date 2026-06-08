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

type WriteFn = (chunk: string) => boolean;

interface Subscriber {
  userId: number;
  write: WriteFn;
}

const subscribers = new Set<Subscriber>();

export function addSubscriber(userId: number, write: WriteFn): () => void {
  const sub: Subscriber = { userId, write };
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}

export function emitGroupEvent(event: GroupEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const sub of subscribers) {
    try {
      sub.write(payload);
    } catch {
    }
  }
}
