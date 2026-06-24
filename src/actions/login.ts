import type { Page } from "playwright";
import { dismissPopups } from "../browser";
import { humanClick, humanType, sleep } from "../human";

const HOME_URL = "https://www.tiktok.com/";
const LOGIN_URL = "https://www.tiktok.com/login/phone-or-email/email";

export type LoginStatus = {
  loggedIn: boolean;
  requiresLogin: boolean;
};

/** Visit the TikTok home page and infer whether an active session exists. */
export async function checkLoginStatus(page: Page): Promise<LoginStatus> {
  await page.goto(HOME_URL, { waitUntil: "domcontentloaded" });
  await sleep(1500);
  await dismissPopups(page);

  const loginButton = page.getByRole("button", { name: /^log in$/i });
  const signUpLink = page.getByRole("link", { name: /^sign up$/i });
  const uploadLink = page.getByRole("link", { name: /upload/i });
  const inboxLink = page.locator('a[href*="/inbox"], a[href*="/messages"]');
  const profileNav = page.locator(
    '[data-e2e="profile-icon"], [data-e2e="nav-profile"], a[href*="/@"][href*="/video"]'
  );

  const showsLogin = await loginButton
    .isVisible({ timeout: 4000 })
    .catch(() => false);
  const showsSignUp = await signUpLink
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  const hasUpload = await uploadLink
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  const hasInbox = await inboxLink
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  const hasProfileNav = await profileNav
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  const loggedIn = (hasUpload || hasInbox || hasProfileNav) && !showsLogin;
  const requiresLogin = showsLogin || showsSignUp || !loggedIn;

  if (loggedIn) {
    console.log("Session active — user is logged in on tiktok.com.");
  } else {
    console.log("No active session — login required on tiktok.com.");
  }

  return { loggedIn, requiresLogin };
}

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  const status = await checkLoginStatus(page);
  if (status.loggedIn) {
    return;
  }

  await sleep(10000);
  if (page.url() === HOME_URL && status.loggedIn) {
    console.log("Already logged in to TikTok.");
    return;
  } else if (!status.loggedIn || status.requiresLogin) {
    console.log("Logging in to TikTok...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
    await dismissPopups(page);
    await sleep(10000);

    if (page.url() === HOME_URL) {
      console.log("Redirected to the home page, not proceeding with login.");
      return;
    }

    const usernameInput = page
      .locator(
        'input[name="username"], input[placeholder*="Email or username" i], input[type="text"]'
      )
      .first();
    await usernameInput.waitFor({ state: "visible", timeout: 20000 });
    await humanType(page, usernameInput, username);

    const passwordInput = page
      .locator('input[type="password"], input[placeholder*="Password" i]')
      .first();
    await passwordInput.waitFor({ state: "visible", timeout: 10000 });
    await humanType(page, passwordInput, password);

    const loginButton = page
      .getByRole("button", { name: /^log in$/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    await humanClick(page, loginButton);

    await page.pause();

    await page
      .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 60000 })
      .catch(() => undefined);

    await sleep(3000);
    await dismissPopups(page);
  }

  console.log("Login successful.");
}
