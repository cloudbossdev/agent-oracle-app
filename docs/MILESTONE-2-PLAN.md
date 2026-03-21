# Milestone 2 Plan: Real Provider Integration

## Goal

Replace the mock-only execution path with a real local shell-command-backed
provider while preserving deterministic testing and the current orchestration
structure.

## Why This Milestone Comes Next

The project now has a stable baseline, CI, setup documentation, and an explicit
provider direction decision. The largest remaining gap between the MVP and a
real usable tool is that runs still use mock output instead of real execution.

## Provider Direction Summary

Milestone 2 follows the decision in [PROVIDER-DIRECTION.md](./PROVIDER-DIRECTION.md):

- first real provider is local shell-command-backed
- `agents/*.md` become runtime source-of-truth instruction files
- provider selection stays simple and environment-driven
- mock provider remains the deterministic default for CI and most tests

## Deliverables

1. Agent instruction files are loaded and used at runtime.
2. A real `ShellCommandAgentProvider` exists and can execute one configured
   external command.
3. The app can switch between `mock` and `shell` providers via environment
   configuration.
4. Shell provider execution handles invalid output, non-zero exit, and timeout
   failures cleanly.
5. Tests cover the shell-provider path without making CI depend on a live agent
   CLI.

## Tasks

### Task 1: Load Agent Instruction Files At Runtime

Purpose:
make agent markdown files part of real execution instead of passive metadata

Scope:

- load the contents of each agent instruction file
- define where instruction text is included in runtime inputs
- keep current markdown artifact generation readable

Definition of done:

- runtime execution can access the text from `agents/*.md`
- prompt assembly includes instruction content
- existing artifact behavior still works

Suggested branch:

- `feature/load-agent-instructions`

### Task 2: Implement ShellCommandAgentProvider

Purpose:
replace the placeholder shell provider with a real local execution path

Scope:

- invoke a configured external command
- pass runtime prompt input to that command
- parse JSON output into `AgentExecutionResult`

Definition of done:

- the provider executes a configured command successfully
- valid JSON output becomes a normal completed run step
- provider errors are surfaced clearly

Suggested branch:

- `feature/implement-shell-provider`

### Task 3: Add Provider Selection And Config Validation

Purpose:
allow the app to choose between `mock` and `shell` modes safely

Scope:

- support `AGENT_PROVIDER`
- support `AGENT_COMMAND`
- support `AGENT_COMMAND_ARGS`
- support `AGENT_TIMEOUT_MS`
- fail early on invalid configuration

Definition of done:

- provider mode is chosen from environment configuration
- invalid shell configuration produces a clear startup or run-time error
- default behavior remains `mock`

Suggested branch:

- `feature/add-provider-config`

### Task 4: Add Failure Handling And Error Recording For Real Execution

Purpose:
ensure failed shell execution does not corrupt workflow state

Scope:

- handle non-zero exit
- handle timeout
- handle invalid JSON
- handle missing required output fields
- confirm run and step statuses move to failed cleanly

Definition of done:

- expected failure cases are captured and persisted
- failed runs are understandable from DB state and UI-visible output

Suggested branch:

- `fix/shell-provider-failure-handling`

### Task 5: Add Shell-Provider Tests Without Breaking Deterministic CI

Purpose:
validate real-provider logic while preserving stable CI behavior

Scope:

- add tests that simulate shell-provider command behavior
- keep `mock` as the default CI provider
- avoid dependence on an external live CLI in GitHub Actions

Definition of done:

- shell-provider parsing and error behavior are covered by tests
- CI remains deterministic
- existing tests continue to pass

Suggested branch:

- `test/add-shell-provider-coverage`

## Recommended Execution Order

1. Load agent instruction files at runtime
2. Add provider selection and config validation
3. Implement shell provider
4. Add failure handling and error recording
5. Add shell-provider tests without breaking deterministic CI

This order is deliberate:

- instruction loading clarifies prompt assembly first
- config validation defines how the app selects provider mode
- shell provider implementation is easier once prompt and config shape are known
- failure handling should be tightened before calling the provider "usable"
- test expansion should lock in the final behavior, not a moving target

## Risks And Watchpoints

- prompt assembly can become messy if instruction loading is bolted on late
- shell invocation details can become platform-sensitive
- output parsing needs strict validation to avoid half-valid run state
- CI must not be coupled to a real external agent command

## Acceptance Criteria For Milestone 2

Milestone 2 is complete when:

- the app can run with `AGENT_PROVIDER=shell`
- agent instruction files are used during runtime prompt assembly
- shell execution is configurable and documented
- invalid shell execution fails clearly and cleanly
- deterministic CI still passes without external live agent dependencies

## Likely First Implementation Branch

The best first implementation branch is:

- `feature/load-agent-instructions`

Reason:

- it is the smallest clean slice of Milestone 2
- it turns existing agent files into real runtime inputs
- it reduces ambiguity before implementing command execution
- it prepares the data flow that the shell provider will need

