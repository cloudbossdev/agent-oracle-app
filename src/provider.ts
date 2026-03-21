// @ts-nocheck
import type { AgentExecutionInput, AgentExecutionResult, AgentProvider } from './types.js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAgentProvider implements AgentProvider {
  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    await sleep(200 + input.stepOrder * 120);
    const relayNote = input.workflowMode === 'relay' ? 'Relay sequencing was applied.' : 'Independent sequencing was applied.';
    const contextNote = input.priorContext === 'None' ? 'No prior context was required for this step.' : 'Primary prior context was incorporated for this step.';
    return {
      summary: `${input.agent.display_name} completed a deterministic ${input.agent.role_name.toLowerCase()} review.`,
      response: `${relayNote} ${contextNote} ${input.agent.display_name} reviewed the question \"${input.questionText}\" and completed task: ${input.task}`,
      risks: `${input.agent.display_name} notes this is mock output for validation, so it proves orchestration rather than live model quality.`,
      nextStep: input.agent.is_synthesizer ? 'Inspect the final synthesis and markdown files.' : 'Advance to the next fixed workflow step.',
    };
  }
}

export class ShellCommandAgentProvider implements AgentProvider {
  async execute(): Promise<AgentExecutionResult> {
    throw new Error('ShellCommandAgentProvider is only a placeholder in this MVP.');
  }
}
