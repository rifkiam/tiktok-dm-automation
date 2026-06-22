/** Day-of-week (0 = Sunday) → search topic */
export const WEEKLY_TOPICS: Record<number, string> = {
  1: "ishowspeed",
  2: "nba funny moments",
  3: "drake",
  4: "dating advice",
  5: "muslim advice",
  6: "anime",
  0: "workout",
};

export function getTodayTopic(date = new Date()): string {
  const day = date.getDay();
  const topic = WEEKLY_TOPICS[day];
  if (!topic) {
    throw new Error(`No topic configured for day ${day}`);
  }
  return topic;
}

export function getDayName(date = new Date()): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}
