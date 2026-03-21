# Provider Direction Decision

## Purpose

This document defines the chosen direction for Milestone 2: Real Provider
Integration.

It exists to remove ambiguity before implementation starts.

## Decision Summary

The first real provider for `agent-oracle-app` should be a local
shell-command-backed provider.

This means:

- the app keeps the current `AgentProvider` interface
- the mock provider remains available for deterministic testing
- the first real provider invokes a configurable local command
- `agents/*.md` become runtime source-of-truth instruction files

## Why This Direction

This is the best first step because it matches the current project shape:

- the app is intentionally local-first
- the repo already contains a placeholder `ShellCommandAgentProvider`
- the current UI and conductor do not need a cloud-specific provider yet
- a shell-backed integration keeps the orchestration layer stable while making
  execution real

This also avoids overcommitting too early to a direct API provider or a more
complex multi-provider system before the first real execution path exists.

## Chosen Provider Model

The first real provider should:

- call one configurable external executable or CLI
- send the assembled runtime prompt as input
- receive a structured result from that command
- map the result into the existing `AgentExecutionResult` shape

The provider should remain single-provider and local-only for the first
implementation.

## Runtime Prompt Source Of Truth

`agents/*.md` should become the source-of-truth instruction files for each
agent.

That means the runtime input for an agent should combine:

1. agent instruction file contents
2. original question
3. workflow mode
4. prior context
5. current task

The provider should no longer rely only on hardcoded role/task wording when the
real execution path is used.

## Output Contract

The first shell-backed provider should expect the external command to return a
JSON object on stdout with this shape:

```json
{
  "summary": "short summary",
  "response": "main response",
  "risks": "risks and caveats",
  "nextStep": "recommended next step"
}
```

If the external command:

- exits non-zero
- times out
- returns invalid JSON
- omits required fields

the current step should fail and the run should move to failed state with a
captured error message.

## Initial Configuration Direction

The first implementation should support these environment variables:

- `AGENT_PROVIDER`
  - allowed values: `mock`, `shell`
  - default: `mock`
- `AGENT_COMMAND`
  - full command path or executable name for the shell-backed provider
- `AGENT_COMMAND_ARGS`
  - optional command arguments for the provider invocation
- `AGENT_TIMEOUT_MS`
  - optional provider timeout in milliseconds

The app should fail early with a clear error if:

- `AGENT_PROVIDER=shell`
- but the required shell provider configuration is incomplete

## Testing Direction

The existing deterministic `MockAgentProvider` should remain the default test
provider for automated CI.

That means:

- current tests stay stable and deterministic
- shell-backed provider behavior should be tested separately
- CI should not depend on a live external agent CLI by default

## Explicit Non-Goals For The First Real Provider

The first real provider should not try to solve all future provider needs.

Out of scope for the first implementation:

- direct cloud API integration
- multi-provider routing
- per-agent provider selection
- streaming token output
- parallel execution redesign
- full prompt templating system beyond loading the current instruction files

## Milestone 2 Implementation Implications

Milestone 2 should likely include these tasks:

1. load `instruction_file` contents at runtime
2. implement `ShellCommandAgentProvider`
3. add provider selection from environment configuration
4. define shell command invocation and JSON parsing
5. add timeout and failure handling
6. add tests for shell-provider behavior without breaking deterministic CI

## Result

Milestone 2 should proceed with this assumption:

the first real provider is a local shell-command integration, and the existing
agent markdown files become the runtime instruction source for that provider.

