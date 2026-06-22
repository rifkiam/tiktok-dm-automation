import type { Page } from "playwright";
import { dismissPopups } from "../browser";
import { humanClick, humanType, humanTypeMessage, sleep } from "../human";

export async function sendVideoToFriend(
  page: Page,
  videoUrl: string,
  friendUsername: string,
  topic: string
): Promise<void> {
  console.log(`Sending video to @${friendUsername}...`);

  await page.goto(videoUrl, { waitUntil: "domcontentloaded" });
  await dismissPopups(page);
  await sleep(2000);

  const sharedViaUi = await tryShareViaVideoButton(
    page,
    videoUrl,
    friendUsername,
    topic
  );
  if (sharedViaUi) {
    console.log("Video shared via TikTok share menu.");
    return;
  }

  // await sendViaMessages(page, videoUrl, friendUsername, topic);
  // console.log("Video link sent via Messages.");
}

async function tryShareViaVideoButton(
  page: Page,
  videoUrl: string,
  friendUsername: string,
  topic: string
): Promise<boolean> {
  const shareButton = page
    .locator(
      'button[data-e2e="share-icon"], button[aria-label*="Share" i], button:has(svg)'
    )
    .filter({ has: page.locator("..") })
    .first();

  const shareByLabel = page.getByRole("button", { name: /share/i }).first();
  const button = (await shareByLabel.isVisible({ timeout: 5000 }).catch(() => false))
    ? shareByLabel
    : shareButton;

  if (!(await button.isVisible({ timeout: 5000 }).catch(() => false))) {
    return false;
  }

  await humanClick(page, button);
  await sleep(1500);

  const sendToFriend = page
    .locator(`[data-e2e="share-${friendUsername}"]`)
    .first();

  const modalSendButton = page.getByRole("button", { name: /send/i }).first();

  if (await sendToFriend.isVisible({ timeout: 4000 }).catch(() => false)) {
    await humanClick(page, sendToFriend);
    await sleep(1000);
    await humanClick(page, modalSendButton);
    await sleep(500);
    return true;
    // return pickFriendAndSend(page, friendUsername, topic);
  }

  const copyLink = page.getByText(/copy link/i).first();
  if (await copyLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await humanClick(page, copyLink);
    await sleep(500);
    await sendViaMessages(page, videoUrl, friendUsername, topic);
    return true;
  }

  return false;
}

async function pickFriendAndSend(
  page: Page,
  friendUsername: string,
  topic: string
): Promise<boolean> {
  const searchInput = page
    .locator(
      'input[placeholder*="Search" i], input[placeholder*="friend" i], input[type="search"]'
    )
    .first();

  if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await humanType(page, searchInput, friendUsername);
    await sleep(1500);
  }

  const friendRow = page
    .locator(`[data-e2e="share-user-item"], div[role="listitem"]`)
    .filter({ hasText: new RegExp(friendUsername, "i") })
    .first();

  if (!(await friendRow.isVisible({ timeout: 8000 }).catch(() => false))) {
    return false;
  }

  await humanClick(page, friendRow);
  await sleep(800);

  const messageInput = page
    .locator(
      'div[contenteditable="true"], textarea[placeholder*="message" i], input[placeholder*="message" i]'
    )
    .first();

  const caption = `Today's pick (${topic})`;
  if (await messageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await humanTypeMessage(page, messageInput, caption);
  }

  const sendButton = page
    .getByRole("button", { name: /^send$/i })
    .or(page.locator('[data-e2e="share-send"]'))
    .first();

  if (await sendButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await humanClick(page, sendButton);
    await sleep(1500);
    return true;
  }

  return false;
}

async function sendViaMessages(
  page: Page,
  videoUrl: string,
  friendUsername: string,
  topic: string
): Promise<void> {
  await page.goto("https://www.tiktok.com/messages", {
    waitUntil: "domcontentloaded",
  });
  await dismissPopups(page);
  await sleep(2000);

  const conversation = page
    .locator('[data-e2e="chat-list-item"], a[href*="/messages"]')
    .filter({ hasText: new RegExp(friendUsername, "i") })
    .first();

  if (await conversation.isVisible({ timeout: 10000 }).catch(() => false)) {
    await humanClick(page, conversation);
  } else {
    const newChat = page
      .getByRole("button", { name: /new message|compose/i })
      .or(page.locator('[data-e2e="message-new"]'))
      .first();

    if (await newChat.isVisible({ timeout: 5000 }).catch(() => false)) {
      await humanClick(page, newChat);
      await sleep(1000);

      const search = page
        .locator('input[placeholder*="Search" i], input[type="search"]')
        .first();
      await humanType(page, search, friendUsername);
      await sleep(1500);

      const user = page
        .locator('[data-e2e="chat-list-item"], div[role="option"]')
        .filter({ hasText: new RegExp(friendUsername, "i") })
        .first();
      await humanClick(page, user);
    } else {
      throw new Error(
        `Could not find conversation with @${friendUsername}. Open Messages once manually to sync contacts.`
      );
    }
  }

  await sleep(1500);

  const messageBox = page
    .locator(
      'div[contenteditable="true"][data-e2e="message-input-area"], div[contenteditable="true"], textarea'
    )
    .last();

  await messageBox.waitFor({ state: "visible", timeout: 15000 });
  const message = `Today's pick (${topic}): ${videoUrl}`;
  await humanTypeMessage(page, messageBox, message);

  const sendBtn = page
    .getByRole("button", { name: /^send$/i })
    .or(page.locator('[data-e2e="message-send"]'))
    .last();

  await humanClick(page, sendBtn);
  await sleep(1500);
}
