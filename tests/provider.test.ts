// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAgentProvider, ShellCommandAgentProvider, parseCommandArgs, resolveConfiguredProvider, resolveProviderConfig } from '../src/provider.js';

function withProviderEnv(env: Record<string, string | undefined>, callback: () => void) {
  const snapshot = {
    AGENT_PROVIDER: process.env.AGENT_PROVIDER,
    AGENT_COMMAND: process.env.AGENT_COMMAND,
    AGENT_COMMAND_ARGS: process.env.AGENT_COMMAND_ARGS,
    AGENT_TIMEOUT_MS: process.env.AGENT_TIMEOUT_MS,
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
  const provider = resolveConfiguredProvider();
  assert.equal(provider instanceof ShellCommandAgentProvider, true);
  assert.equal(provider.command, 'oracle-cli');
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
