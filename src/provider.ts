// @ts-nocheck
import { spawn } from 'node:child_process';
import OpenAI from 'openai';
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

  if (providerName !== 'mock' && providerName !== 'shell' && providerName !== 'openai') {
    throw new Error(`Unsupported AGENT_PROVIDER value "${providerName}". Expected "mock", "shell", or "openai".`);
  }

  const timeoutValue = String(process.env.AGENT_TIMEOUT_MS ?? '').trim();
  let timeoutMs: number | null = null;
  if (timeoutValue) {
    timeoutMs = Number(timeoutValue);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new Error('AGENT_TIMEOUT_MS must be a positive number when provided.');
    }
  }

  if (providerName === 'mock') {
    return { providerName, command: null, args: [], timeoutMs: null, apiKey: null, model: null };
  }

  if (providerName === 'openai') {
    const apiKey = String(process.env.OPENAI_API_KEY ?? '').trim();
    if (!apiKey) {
      throw new Error('AGENT_PROVIDER is set to "openai" but OPENAI_API_KEY is not configured.');
    }

    const model = String(process.env.OPENAI_MODEL ?? '').trim();
    if (!model) {
      throw new Error('AGENT_PROVIDER is set to "openai" but OPENAI_MODEL is not configured.');
    }

    return {
      providerName,
      command: null,
      args: [],
      timeoutMs,
      apiKey,
      model,
    };
  }

  const command = String(process.env.AGENT_COMMAND ?? '').trim();
  if (!command) {
    throw new Error('AGENT_PROVIDER is set to "shell" but AGENT_COMMAND is not configured.');
  }

  return {
    providerName,
    command,
    args: parseCommandArgs(process.env.AGENT_COMMAND_ARGS),
    timeoutMs,
    apiKey: null,
    model: null,
  };
}

export function resolveConfiguredProvider() {
  const config = resolveProviderConfig();
  if (config.providerName === 'mock') {
    return new MockAgentProvider();
  }
  if (config.providerName === 'openai') {
    return new OpenAIAgentProvider(config);
  }
  return new ShellCommandAgentProvider(config);
}

function validateProviderOutput(payload: unknown, providerLabel: string): AgentExecutionResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`${providerLabel} returned invalid JSON: expected an object.`);
  }

  const result = payload as Record<string, unknown>;
  for (const field of ['summary', 'response', 'risks', 'nextStep']) {
    if (typeof result[field] !== 'string' || result[field].trim() === '') {
      throw new Error(`${providerLabel} returned invalid JSON: missing string field "${field}".`);
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
            resolve(validateProviderOutput(parsed, 'Shell provider'));
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

export class OpenAIAgentProvider implements AgentProvider {
  apiKey: string;
  model: string;
  timeoutMs: number | null;
  client: {
    responses: {
      create: (params: Record<string, unknown>) => Promise<{ output_text?: string | null }>;
    };
  };

  constructor(
    config: { apiKey: string; model: string; timeoutMs?: number | null },
    client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeoutMs ?? undefined,
      maxRetries: 0,
    }),
  ) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.timeoutMs = config.timeoutMs ?? null;
    this.client = client;
  }

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    let response;
    try {
      response = await this.client.responses.create({
        model: this.model,
        instructions: [
          `You are ${input.agent.display_name}, acting as ${input.agent.role_name}.`,
          'Return only one JSON object with the exact keys: summary, response, risks, nextStep.',
          'Each field must be a non-empty string.',
          'Do not wrap the JSON in markdown fences.',
        ].join(' '),
        input: input.inputText,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`OpenAI provider request failed: ${message}`);
    }

    const outputText = String(response.output_text ?? '').trim();
    if (!outputText) {
      throw new Error('OpenAI provider returned empty output.');
    }

    try {
      return validateProviderOutput(JSON.parse(outputText), 'OpenAI provider');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith('OpenAI provider returned invalid JSON:')) {
        throw error;
      }
      throw new Error(`OpenAI provider returned invalid JSON: ${message}`);
    }
  }
}
