import { serve } from "inngest/next";
import { checkpointWorker } from "@/server/assessment/checkpoint-worker";
import { inngest } from "@/server/assessment/inngest";
import {
  prepareSimulation,
  markSimulation,
  reconcileSimulationTimers,
} from "@/server/assessment/simulation-worker";

export const maxDuration = 120;
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkpointWorker,
    prepareSimulation,
    markSimulation,
    reconcileSimulationTimers,
  ],
});
