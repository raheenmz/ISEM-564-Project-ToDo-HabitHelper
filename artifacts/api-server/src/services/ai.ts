import { logger } from "../lib/logger";

export interface AiSuggestedTask {
  title: string;
  description: string;
  deadline: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

const FALLBACK_SUGGESTIONS: AiSuggestedTask[] = [
  { title: "Research and plan your goal", description: "Break down the goal into specific, actionable steps.", deadline: null, priority: "HIGH" },
  { title: "Set up a daily practice schedule", description: "Block time each day to work toward your goal.", deadline: null, priority: "MEDIUM" },
  { title: "Review your progress weekly", description: "Track what's working and adjust your approach.", deadline: null, priority: "LOW" },
];

export async function suggestTasksForGoal(goal: string, targetDate?: string): Promise<AiSuggestedTask[]> {
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!baseUrl || !apiKey) {
    logger.warn("No AI API key/URL configured — returning fallback suggestions");
    return enrichFallback(goal, targetDate);
  }

  const today = new Date().toISOString().split("T")[0];
  const deadlineClause = targetDate ? `The target date is ${targetDate}.` : "No specific target date.";

  const prompt = `You are a productivity coach. The user wants to achieve this goal: "${goal}". ${deadlineClause} Today is ${today}.

Suggest 3-5 concrete, actionable tasks that will help them achieve this goal. Each task should be specific and completable.

Respond ONLY with a valid JSON array (no markdown, no explanation). Each element must have:
- "title": string (short task name, max 80 chars)
- "description": string (one-sentence description)
- "deadline": string in YYYY-MM-DD format or null
- "priority": one of "HIGH", "MEDIUM", "LOW"

Example: [{"title":"...","description":"...","deadline":"2025-01-15","priority":"HIGH"}]`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "AI API returned non-OK status — falling back");
      return enrichFallback(goal, targetDate);
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data?.choices?.[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      logger.warn("AI response contained no JSON array — falling back");
      return enrichFallback(goal, targetDate);
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return enrichFallback(goal, targetDate);
    }

    const validated: AiSuggestedTask[] = parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        title: String(item.title ?? "Task").slice(0, 80),
        description: String(item.description ?? ""),
        deadline: typeof item.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.deadline) ? item.deadline : null,
        priority: (["HIGH", "MEDIUM", "LOW"].includes(String(item.priority)) ? item.priority : "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
      }))
      .slice(0, 5);

    return validated.length > 0 ? validated : enrichFallback(goal, targetDate);
  } catch (err) {
    logger.warn({ err }, "AI suggestion failed — returning fallback");
    return enrichFallback(goal, targetDate);
  }
}

function enrichFallback(goal: string, targetDate?: string): AiSuggestedTask[] {
  return FALLBACK_SUGGESTIONS.map((s, i) => ({
    ...s,
    deadline: i === 0 && targetDate ? targetDate : null,
  }));
}
