import type { Page } from "playwright";
import { dismissPopups } from "../browser";
import { humanClick, sleep } from "../human";

export interface FoundVideo {
  url: string;
  topic: string;
}

export async function findReelForTopic(
  page: Page,
  topic: string
): Promise<FoundVideo> {
  const encoded = encodeURIComponent(topic);
  const searchUrl = `https://www.tiktok.com/search/video?q=${encoded}`;

  console.log(`Searching for reels: "${topic}"`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  await dismissPopups(page);
  await sleep(2000);

  const videosTab = page.getByRole("tab", { name: /videos/i });
  if (await videosTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await humanClick(page, videosTab);
    await sleep(1500);
  }

  console.log("currentpage", page.url());

  const videoLinks = page.locator('a[href*="/video/"]');
  await videoLinks.first().waitFor({ state: "visible", timeout: 30000 });

  const count = await videoLinks.count();
  const pickIndex = Math.min(
    Math.floor(Math.random() * Math.min(5, count)),
    count - 1
  );
  const chosen = videoLinks.nth(pickIndex);
  const href = await chosen.getAttribute("href");

  if (!href) {
    throw new Error(`No video found for topic: ${topic}`);
  }

  const url = href.startsWith("http")
    ? href.split("?")[0]
    : `https://www.tiktok.com${href.split("?")[0]}`;

  console.log(`Selected video: ${url}`);
  return { url, topic };
}
