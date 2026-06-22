import type { BrowserContext } from "playwright";
import { login } from "./actions/login";
import { findReelForTopic } from "./actions/search";
import { sendVideoToFriend } from "./actions/share";
import { getMainPage, launchContext } from "./browser";
import { config } from "./config";
import { getDayName, getTodayTopic } from "./schedule";
import { sleep } from "./human";

export async function runDailyWorkflow(): Promise<void> {
  const topic = getTodayTopic();
  const dayName = getDayName();

  console.log(`\n=== ${dayName}: "${topic}" ===\n`);

  let context: BrowserContext | undefined;

  try {
    context = await launchContext();
    const page = await getMainPage(context);

    await login(page, config.username, config.password);
    const video = await findReelForTopic(page, topic);
    await sendVideoToFriend(
      page,
      video.url,
      config.friendUsername,
      video.topic
    );

    await sleep(5000);

    console.log(`\nDone! Sent "${topic}" reel to @${config.friendUsername}.`);
  } finally {
    await context?.close().catch(() => undefined);
  }
}
