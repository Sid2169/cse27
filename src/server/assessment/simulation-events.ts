import "server-only";
import { inngest } from "./inngest";

export const simulationRequested = "cse27/chapter-simulation.requested";
export const simulationSubmitted = "cse27/chapter-simulation.submitted";

export type SimulationEvent = { id: string; token: string };

export function simulationEvent(
  kind: "prepare" | "mark",
  { id, token }: SimulationEvent,
) {
  return {
    name: kind === "prepare" ? simulationRequested : simulationSubmitted,
    id: kind + "-" + token,
    data: { id, token },
  };
}

export async function dispatchSimulation(
  kind: "prepare" | "mark",
  event: SimulationEvent,
) {
  try {
    await inngest.send(simulationEvent(kind, event));
    return true;
  } catch {
    console.warn("Could not send chapter simulation event", {
      kind,
      id: event.id,
    });
    return false;
  }
}
