import type { Flow } from '../schemas/map';
import type { ProjectSnapshot } from '../schemas/snapshot';

/** RN 1: a flow is an ordered sequence of existing connections. */

export function addFlow(
  snapshot: ProjectSnapshot,
  input: { id: string; name: string; steps: string[] },
): ProjectSnapshot {
  if (input.steps.length === 0) throw new Error('A flow needs at least one connection');
  const flow: Flow = {
    id: input.id,
    projectId: snapshot.project.id,
    name: input.name.trim(),
    steps: [...input.steps],
  };
  return { ...snapshot, flows: [...snapshot.flows, flow] };
}

export function renameFlow(snapshot: ProjectSnapshot, flowId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return snapshot;
  return {
    ...snapshot,
    flows: snapshot.flows.map((flow) => (flow.id === flowId ? { ...flow, name: trimmed } : flow)),
  };
}

export function removeFlow(snapshot: ProjectSnapshot, flowId: string) {
  const flow = snapshot.flows.find((f) => f.id === flowId);
  return {
    removed: flow,
    snapshot: { ...snapshot, flows: snapshot.flows.filter((f) => f.id !== flowId) },
  };
}

/** Puts a removed flow back in its place (Desfazer). */
export function restoreFlow(snapshot: ProjectSnapshot, flow: Flow, index: number) {
  if (snapshot.flows.some((f) => f.id === flow.id)) return snapshot;
  const flows = [...snapshot.flows];
  flows.splice(Math.min(index, flows.length), 0, flow);
  return { ...snapshot, flows };
}

/**
 * While drawing a flow, the next connection has to start where the last one ended,
 * so the flow reads as a path.
 */
export function canAppendStep(
  snapshot: Pick<ProjectSnapshot, 'connections'>,
  steps: readonly string[],
  connectionId: string,
): boolean {
  const next = snapshot.connections.find((c) => c.id === connectionId);
  if (!next || steps.includes(connectionId)) return false;
  const lastId = steps.at(-1);
  if (lastId === undefined) return true;
  const last = snapshot.connections.find((c) => c.id === lastId);
  return last !== undefined && last.to === next.from;
}
