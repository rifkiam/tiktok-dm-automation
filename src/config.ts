import "dotenv/config";
import path from "path";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  username: requireEnv("TIKTOK_USERNAME"),
  password: requireEnv("TIKTOK_PASSWORD"),
  friendUsername: requireEnv("TIKTOK_FRIEND_USERNAME"),
  scheduleHour: Number(process.env.SCHEDULE_HOUR ?? "18"),
  scheduleMinute: Number(process.env.SCHEDULE_MINUTE ?? "0"),
  timezone: process.env.TZ ?? "UTC",
  headless: process.env.HEADLESS === "true",
  userDataDir: path.resolve(process.env.USER_DATA_DIR ?? "./.browser-data"),
};
