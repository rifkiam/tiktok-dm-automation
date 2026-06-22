import cron from "node-cron";
import { config } from "./config";
import { runDailyWorkflow } from "./workflow";

const hour = config.scheduleHour;
const minute = config.scheduleMinute;

const cronExpression = `${minute} ${hour} * * *`;

console.log("TikTok daily reel DM automation");
console.log(`Schedule: every day at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} (${config.timezone})`);
console.log(`Cron: ${cronExpression}`);
console.log("Waiting for next run...\n");

cron.schedule(
  cronExpression,
  async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled run...`);
    try {
      await runDailyWorkflow();
    } catch (error) {
      console.error("Scheduled run failed:", error);
    }
  },
  { timezone: config.timezone }
);

process.on("SIGINT", () => {
  console.log("\nShutting down scheduler.");
  process.exit(0);
});
