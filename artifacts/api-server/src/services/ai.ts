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
        model: "gemini-3.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 8192,
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

export interface HabitRobotChatHabitItem {
  id: number;
  title: string;
  classification: string | null;
  priority: string;
  tasksThisMonth: number;
  completedThisMonth: number;
  completedToday: boolean;
}

const HABIT_ROBOT_SYSTEM_PROMPT = `You are the Habit Helper Robot, a friendly and motivating assistant built into the Task Force productivity app. Your two jobs are:

1. Help users understand and update their habit completion progress (% complete).
2. Deliver relevant, credible habit-science quotes to inspire continued effort.

Tone: warm, concise, encouraging. Never preachy. One quote per response unless the user asks for more.`;

const HABIT_ROBOT_FALLBACK = `Hey there! 👋 I'm your Habit Helper Robot. I can see your habits but my AI brain isn't connected right now.

Here's some timeless wisdom while I'm offline:

"We are what we repeatedly do. Excellence, then, is not an act, but a habit."
— Aristotle

Keep showing up — consistency is the only secret!`;

export async function chatWithHabitRobot(
  habits: HabitRobotChatHabitItem[],
  message?: string,
): Promise<string> {
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!baseUrl || !apiKey) {
    logger.warn("No AI API key/URL configured — returning fallback robot reply");
    return HABIT_ROBOT_FALLBACK;
  }

  const habitDataJson = JSON.stringify(habits, null, 2);
  const userContent = message?.trim()
    ? message.trim()
    : `The user has the following active habits today. For each habit, a completion status is provided.\n\nHabit data (JSON):\n${habitDataJson}\n\nPlease analyse this data and:\n1. Show each habit's name, monthly % complete (completedThisMonth / tasksThisMonth * 100, rounded), and a short one-line status.\n2. Pick ONE quote from a credible source (BJ Fogg, James Clear, Phillippa Lally, Wendy Wood, B.F. Skinner, William James, Aristotle, or peer-reviewed research) that best fits the user's situation. If overall completion is below 50%, choose something encouraging about starting small. If above 80%, choose something about maintaining streaks or compounding gains. Include the author's full name and source.\n\nDo not fabricate quotes. Use plain text — no markdown headers or bullet asterisks, just clean readable lines.`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-3.5-flash",
        messages: [
          { role: "system", content: HABIT_ROBOT_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_completion_tokens: 800,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "AI API returned non-OK status for robot chat — falling back");
      return HABIT_ROBOT_FALLBACK;
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return content || HABIT_ROBOT_FALLBACK;
  } catch (err) {
    logger.warn({ err }, "Habit robot chat failed — returning fallback");
    return HABIT_ROBOT_FALLBACK;
  }
}
