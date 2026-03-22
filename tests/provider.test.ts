// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MockAgentProvider, OpenAIAgentProvider, ShellCommandAgentProvider, parseCommandArgs, resolveConfiguredProvider, resolveProviderConfig } from '../src/provider.js';
import { createTempWorkspace } from './helpers.js';

function withProviderEnv(env: Record<string, string | undefined>, callback: () => void) {
  const snapshot = {
    AGENT_PROVIDER: process.env.AGENT_PROVIDER,
    AGENT_COMMAND: process.env.AGENT_COMMAND,
    AGENT_COMMAND_ARGS: process.env.AGENT_COMMAND_ARGS,
    AGENT_TIMEOUT_MS: process.env.AGENT_TIMEOUT_MS,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  };

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    callback();
  } finally {
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('provider config defaults to mock', () => withProviderEnv({
  AGENT_PROVIDER: undefined,
  AGENT_COMMAND: undefined,
  AGENT_COMMAND_ARGS: undefined,
  AGENT_TIMEOUT_MS: undefined,
}, () => {
  const config = resolveProviderConfig();
  assert.equal(config.providerName, 'mock');
  assert.equal(config.command, null);
  assert.deepEqual(config.args, []);
  assert.equal(config.timeoutMs, null);
  assert.equal(config.apiKey, null);
  assert.equal(config.model, null);
  assert.equal(resolveConfiguredProvider() instanceof MockAgentProvider, true);
}));

test('provider config parses shell settings', () => withProviderEnv({
  AGENT_PROVIDER: 'shell',
  AGENT_COMMAND: 'oracle-cli',
  AGENT_COMMAND_ARGS: '--mode review --json',
  AGENT_TIMEOUT_MS: '15000',
}, () => {
  const config = resolveProviderConfig();
  assert.equal(config.providerName, 'shell');
  assert.equal(config.command, 'oracle-cli');
  assert.deepEqual(config.args, ['--mode', 'review', '--json']);
  assert.equal(config.timeoutMs, 15000);
  assert.equal(config.apiKey, null);
  assert.equal(config.model, null);
  const provider = resolveConfiguredProvider();
  assert.equal(provider instanceof ShellCommandAgentProvider, true);
  assert.equal(provider.command, 'oracle-cli');
}));

test('provider config parses openai settings', () => withProviderEnv({
  AGENT_PROVIDER: 'openai',
  OPENAI_API_KEY: 'sk-test',
  OPENAI_MODEL: 'gpt-5.4-mini',
  AGENT_TIMEOUT_MS: '45000',
}, () => {
  const config = resolveProviderConfig();
  assert.equal(config.providerName, 'openai');
  assert.equal(config.apiKey, 'sk-test');
  assert.equal(config.model, 'gpt-5.4-mini');
  assert.equal(config.timeoutMs, 45000);
  assert.equal(config.command, null);
  assert.deepEqual(config.args, []);
  const provider = resolveConfiguredProvider();
  assert.equal(provider instanceof OpenAIAgentProvider, true);
  assert.equal(provider.model, 'gpt-5.4-mini');
}));

test('shell provider config requires command', () => withProviderEnv({
  AGENT_PROVIDER: 'shell',
  AGENT_COMMAND: undefined,
}, () => {
  assert.throws(() => resolveProviderConfig(), /AGENT_COMMAND is not configured/);
}));

test('provider config rejects invalid timeout', () => withProviderEnv({
  AGENT_PROVIDER: 'shell',
  AGENT_COMMAND: 'oracle-cli',
  AGENT_TIMEOUT_MS: 'not-a-number',
}, () => {
  assert.throws(() => resolveProviderConfig(), /AGENT_TIMEOUT_MS must be a positive number/);
}));

test('openai provider config requires api key', () => withProviderEnv({
  AGENT_PROVIDER: 'openai',
  OPENAI_API_KEY: undefined,
  OPENAI_MODEL: 'gpt-5.4-mini',
}, () => {
  assert.throws(() => resolveProviderConfig(), /OPENAI_API_KEY is not configured/);
}));

test('openai provider config requires model', () => withProviderEnv({
  AGENT_PROVIDER: 'openai',
  OPENAI_API_KEY: 'sk-test',
  OPENAI_MODEL: undefined,
}, () => {
  assert.throws(() => resolveProviderConfig(), /OPENAI_MODEL is not configured/);
}));

test('provider config rejects unsupported provider names', () => withProviderEnv({
  AGENT_PROVIDER: 'api',
}, () => {
  assert.throws(() => resolveProviderConfig(), /Unsupported AGENT_PROVIDER value/);
}));

test('command args parsing handles empty input', () => {
  assert.deepEqual(parseCommandArgs(undefined), []);
  assert.deepEqual(parseCommandArgs(''), []);
  assert.deepEqual(parseCommandArgs('  --foo   bar  '), ['--foo', 'bar']);
});

function buildExecutionInput() {
  return {
    runId: 1,
    workflowMode: 'independent',
    questionText: 'How should this work?',
    agent: {
      id: 1,
      system_name: 'atlas',
      display_name: 'Atlas',
      role_name: 'Systems Architect',
      instruction_file: 'agents/atlas.md',
      sort_order: 1,
      is_synthesizer: 0,
      enabled: 1,
    },
    inputText: '# Agent Input\n\nTest prompt body',
    instructionText: '# Atlas\n- Focus: architecture',
    priorContext: 'None',
    task: 'Review the original question directly and provide your own role-based answer.',
    stepOrder: 1,
  };
}

test('shell provider executes configured command and parses JSON output', async () => {
  const root = createTempWorkspace('provider-shell-success-');
  const scriptPath = path.join(root, 'success.js');
  fs.writeFileSync(scriptPath, `
process.stdin.setEncoding('utf8');
let input = '';
process.stdin.on('data', (chunk) => input += chunk);
process.stdin.on('end', () => {
  process.stdout.write(JSON.stringify({
    summary: 'ok',
    response: input.includes('Test prompt body') ? 'saw prompt' : 'missing prompt',
    risks: 'none',
    nextStep: 'continue'
  }));
});
`);
  const provider = new ShellCommandAgentProvider({ command: process.execPath, args: [scriptPath] });
  const result = await provider.execute(buildExecutionInput());
  assert.equal(result.summary, 'ok');
  assert.equal(result.response, 'saw prompt');
});

test('shell provider rejects invalid JSON output', async () => {
  const root = createTempWorkspace('provider-shell-invalid-json-');
  const scriptPath = path.join(root, 'invalid.js');
  fs.writeFileSync(scriptPath, `process.stdout.write('not-json');`);
  const provider = new ShellCommandAgentProvider({ command: process.execPath, args: [scriptPath] });
  await assert.rejects(() => provider.execute(buildExecutionInput()), /Shell provider returned invalid JSON/);
});

test('shell provider surfaces non-zero command exit', async () => {
  const root = createTempWorkspace('provider-shell-nonzero-');
  const scriptPath = path.join(root, 'nonzero.js');
  fs.writeFileSync(scriptPath, `
process.stderr.write('boom');
process.exit(2);
`);
  const provider = new ShellCommandAgentProvider({ command: process.execPath, args: [scriptPath] });
  await assert.rejects(() => provider.execute(buildExecutionInput()), /Shell provider command failed: boom/);
});

test('shell provider surfaces timeout failures', async () => {
  const root = createTempWorkspace('provider-shell-timeout-');
  const scriptPath = path.join(root, 'timeout.js');
  fs.writeFileSync(scriptPath, `setTimeout(() => process.stdout.write('{}'), 200);`);
  const provider = new ShellCommandAgentProvider({ command: process.execPath, args: [scriptPath], timeoutMs: 50 });
  await assert.rejects(() => provider.execute(buildExecutionInput()), /Shell provider timed out after 50ms/);
});

test('openai provider executes configured client and parses JSON output', async () => {
  const calls: Array<Record<string, unknown>> = [];
  const provider = new OpenAIAgentProvider(
    { apiKey: 'sk-test', model: 'gpt-5.4-mini', timeoutMs: 12000 },
    {
      responses: {
        create: async (params: Record<string, unknown>) => {
          calls.push(params);
          return {
            output_text: JSON.stringify({
              summary: 'Real analysis summary',
              response: 'Real analysis body',
              risks: 'Primary risk',
              nextStep: 'Proceed',
            }),
          };
        },
      },
    },
  );

  const result = await provider.execute(buildExecutionInput());
  assert.equal(result.summary, 'Real analysis summary');
  assert.equal(result.response, 'Real analysis body');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'gpt-5.4-mini');
  assert.equal(typeof calls[0].instructions, 'string');
  assert.equal(calls[0].input, '# Agent Input\n\nTest prompt body');
  assert.equal(calls[0].text.format.type, 'json_schema');
  assert.equal(calls[0].text.format.name, 'agent_review_result');
  assert.equal(calls[0].text.format.strict, true);
  assert.deepEqual(calls[0].text.format.schema.required, ['summary', 'response', 'risks', 'nextStep']);
});

test('openai provider rejects invalid JSON output', async () => {
  const provider = new OpenAIAgentProvider(
    { apiKey: 'sk-test', model: 'gpt-5.4-mini' },
    {
      responses: {
        create: async () => ({ output_text: 'not-json' }),
      },
    },
  );

  await assert.rejects(() => provider.execute(buildExecutionInput()), /OpenAI provider returned invalid JSON/);
});

test('openai provider rejects missing structured fields', async () => {
  const provider = new OpenAIAgentProvider(
    { apiKey: 'sk-test', model: 'gpt-5.4-mini' },
    {
      responses: {
        create: async () => ({ output_text: JSON.stringify({ summary: 'Only summary' }) }),
      },
    },
  );

  await assert.rejects(() => provider.execute(buildExecutionInput()), /missing string field "response"/);
});

test('openai provider surfaces request failures clearly', async () => {
  const provider = new OpenAIAgentProvider(
    { apiKey: 'sk-test', model: 'gpt-5.4-mini' },
    {
      responses: {
        create: async () => {
          throw new Error('401 Unauthorized');
        },
      },
    },
  );

  await assert.rejects(() => provider.execute(buildExecutionInput()), /OpenAI provider request failed: 401 Unauthorized/);
});
