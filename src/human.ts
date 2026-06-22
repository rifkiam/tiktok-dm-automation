import type { Locator, Page } from "playwright";

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Move the pointer in small steps toward (x, y) for a more human feel. */
export async function humanMouseMove(
  page: Page,
  x: number,
  y: number,
  steps = 12
): Promise<void> {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  let currentX = randomBetween(viewport.width * 0.2, viewport.width * 0.8);
  let currentY = randomBetween(viewport.height * 0.2, viewport.height * 0.8);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = t * t * (3 - 2 * t);
    const nextX = currentX + (x - currentX) * eased;
    const nextY = currentY + (y - currentY) * eased;
    await page.mouse.move(nextX, nextY);
    currentX = nextX;
    currentY = nextY;
    await sleep(randomBetween(8, 25));
  }
}

/** Wiggle the pointer near an element before interacting with it. */
export async function movePointerNearElement(
  page: Page,
  locator: Locator
): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    return;
  }

  const targetX = box.x + box.width * randomBetween(0.25, 0.75);
  const targetY = box.y + box.height * randomBetween(0.25, 0.75);

  const wiggleX = targetX + randomBetween(-40, 40);
  const wiggleY = targetY + randomBetween(-30, 30);
  await humanMouseMove(page, wiggleX, wiggleY, 8);
  await sleep(randomBetween(120, 350));
  await humanMouseMove(page, targetX, targetY, 6);
  await sleep(randomBetween(80, 200));
}

/** Click after moving the pointer naturally to the element. */
export async function humanClick(page: Page, locator: Locator): Promise<void> {
  await movePointerNearElement(page, locator);
  await locator.click();
}

/** Type text with small delays between keystrokes. */
export async function humanType(
  page: Page,
  locator: Locator,
  text: string
): Promise<void> {
  await movePointerNearElement(page, locator);
  await locator.click();
  await sleep(randomBetween(150, 400));
  await locator.fill("");
  await locator.pressSequentially(text, { delay: randomBetween(50, 120) });
}

/** Type into contenteditable inputs (e.g. TikTok DM box). */
export async function humanTypeMessage(
  page: Page,
  locator: Locator,
  text: string
): Promise<void> {
  await movePointerNearElement(page, locator);
  await locator.click();
  await sleep(randomBetween(150, 400));
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(text, { delay: randomBetween(40, 100) });
}

export { sleep };
