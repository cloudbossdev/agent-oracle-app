// @ts-nocheck
import { spawn } from 'node:child_process';
import type { AgentExecutionInput, AgentExecutionResult, AgentProvider } from './types.js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseCommandArgs(value: string | undefined) {
  if (!value) return [];
  return value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
}

export function resolveProviderConfig() {
  const providerName = String(process.env.AGENT_PROVIDER ?? 'mock').trim().toLowerCase();

  if (providerName !== 'mock' && providerName !== 'shell') {
    throw new Error(`Unsupported AGENT_PROVIDER value "${providerName}". Expected "mock" or "shell".`);
  }

  if (providerName === 'mock') {
    return { providerName, command: null, args: [], timeoutMs: null };
  }

  const command = String(process.env.AGENT_COMMAND ?? '').trim();
  if (!command) {
    throw new Error('AGENT_PROVIDER is set to "shell" but AGENT_COMMAND is not configured.');
  }

  const timeoutValue = String(process.env.AGENT_TIMEOUT_MS ?? '').trim();
  let timeoutMs: number | null = null;
  if (timeoutValue) {
    timeoutMs = Number(timeoutValue);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new Error('AGENT_TIMEOUT_MS must be a positive number when provided.');
    }
  }

  return {
    providerName,
    command,
    args: parseCommandArgs(process.env.AGENT_COMMAND_ARGS),
    timeoutMs,
  };
}

export function resolveConfiguredProvider() {
  const config = resolveProviderConfig();
  if (config.providerName === 'mock') {
    return new MockAgentProvider();
  }
  return new ShellCommandAgentProvider(config);
}

function validateProviderOutput(payload: unknown): AgentExecutionResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Shell provider returned invalid JSON: expected an object.');
  }

  const result = payload as Record<string, unknown>;
  for (const field of ['summary', 'response', 'risks', 'nextStep']) {
    if (typeof result[field] !== 'string' || result[field].trim() === '') {
      throw new Error(`Shell provider returned invalid JSON: missing string field "${field}".`);
    }
  }

  return {
    summary: result.summary as string,
    response: result.response as string,
    risks: result.risks as string,
    nextStep: result.nextStep as string,
  };
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
  command: string;
  args: string[];
  timeoutMs: number | null;

  constructor(config: { command: string; args?: string[]; timeoutMs?: number | null }) {
    this.command = config.command;
    this.args = config.args ?? [];
    this.timeoutMs = config.timeoutMs ?? null;
  }

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    return await new Promise((resolve, reject) => {
      const child = spawn(this.command, this.args, { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';
      let completed = false;
      let timeoutHandle: any = null;

      const finish = (callback: () => void) => {
        if (completed) return;
        completed = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        callback();
      };

      if (this.timeoutMs) {
        timeoutHandle = setTimeout(() => {
          finish(() => {
            child.kill();
            reject(new Error(`Shell provider timed out after ${this.timeoutMs}ms.`));
          });
        }, this.timeoutMs);
      }

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');

      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });

      child.on('error', (error) => {
        finish(() => reject(new Error(`Shell provider failed to start: ${error.message}`)));
      });

      child.on('close', (code, signal) => {
        finish(() => {
          if (code !== 0) {
            const detail = stderr.trim() || `exit code ${code}${signal ? `, signal ${signal}` : ''}`;
            reject(new Error(`Shell provider command failed: ${detail}`));
            return;
          }

          try {
            const parsed = JSON.parse(stdout.trim() || '{}');
            resolve(validateProviderOutput(parsed));
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reject(new Error(`Shell provider returned invalid JSON: ${message}`));
          }
        });
      });

      child.stdin.write(input.inputText);
      child.stdin.end();
    });
  }
}
