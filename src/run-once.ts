import { runDailyWorkflow } from "./workflow";

runDailyWorkflow().catch((error) => {
  console.error("Run failed:", error);
  process.exit(1);
});
