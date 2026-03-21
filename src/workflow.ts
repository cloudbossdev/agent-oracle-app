// @ts-nocheck
import type { AgentRecord, WorkflowMode } from './types.js';

export function buildTask(agent: AgentRecord, workflowMode: WorkflowMode) {
  if (agent.is_synthesizer) {
    return 'Read the original question and all prior outputs, then produce a concise final synthesis.';
  }
  return workflowMode === 'relay'
    ? 'Review the original question and the latest prior output, using that prior output as your primary context.'
    : 'Review the original question directly and provide your own role-based answer.';
}

export function buildPriorContext(workflowMode: WorkflowMode, agent: AgentRecord, previousOutputs: Array<{ agentName: string; output: string }>) {
  if (agent.is_synthesizer) {
    return previousOutputs.length === 0 ? 'None' : previousOutputs.map((item) => `### ${item.agentName}\n${item.output}`).join('\n\n');
  }
  if (workflowMode === 'independent') {
    return 'None';
  }
  const previous = previousOutputs.at(-1);
  return previous ? `Primary prior context from ${previous.agentName}:\n\n${previous.output}` : 'None';
}
