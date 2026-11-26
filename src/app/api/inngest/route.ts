import { serve } from "inngest/next";
import {
  checkpointWorker,
  inngest,
} from "@/server/assessment/checkpoint-worker";

export const maxDuration = 120;
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [checkpointWorker],
});
