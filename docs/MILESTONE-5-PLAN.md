# Milestone 5 Plan: OpenAI Provider Integration

## Goal

Add a first-class OpenAI-backed provider so the app can run real agent analysis
through the server while preserving the current local workflow, artifact model,
and deterministic CI path.

## Why This Milestone Comes Next

Milestones 1 through 4 produced a stable and testable local product:

- the repo has workflow discipline, CI, release notes, and rollback guidance
- the app has a usable UI with status visibility, history, artifacts, and
  structured output rendering
- the provider layer already supports `mock` and `shell`
- the browser flow is now covered by smoke tests

The biggest remaining product gap is that the best out-of-the-box experience
still depends on deterministic mock output or a custom shell command. The next
logical step is to make the app capable of real hosted analysis through a
native backend OpenAI integration.

## Milestone Direction

Milestone 5 should treat OpenAI as a first-class provider rather than forcing
OpenAI through the shell-command path.

Why:

- the current provider abstraction already supports multiple backends cleanly
- direct backend integration gives better control over config, error handling,
  and observability
- the browser UI should never need direct access to an API key
- the shell provider can remain available for advanced or provider-agnostic use

## Deliverables

1. The app supports `AGENT_PROVIDER=openai`.
2. OpenAI configuration is validated clearly at startup or first use.
3. Agent execution uses a backend OpenAI provider instead of mock output when
   configured.
4. OpenAI responses are mapped reliably into the app's structured
   `summary/response/risks/nextStep` result shape.
5. Setup and safety guidance explain how to use `OPENAI_API_KEY` and related
   provider settings without exposing secrets.
6. Tests cover config and parsing behavior without making CI depend on live API
   calls.

## Tasks

### Task 1: Define OpenAI Provider Config

Purpose:
add a clean and explicit configuration surface for real hosted execution

Scope:

- support `AGENT_PROVIDER=openai`
- support `OPENAI_API_KEY`
- support `OPENAI_MODEL`
- support optional timeout and related provider settings if needed
- fail early on invalid or incomplete configuration

Definition of done:

- the app can resolve `mock`, `shell`, or `openai`
- invalid OpenAI configuration produces a clear error
- default behavior remains deterministic `mock`

Suggested branch:

- `feature/add-openai-provider-config`

### Task 2: Implement OpenAIAgentProvider

Purpose:
add a native backend provider that calls OpenAI directly

Scope:

- create an `OpenAIAgentProvider`
- send assembled agent input through the backend provider layer
- keep agent instruction loading and artifact generation unchanged
- preserve the current provider interface so the rest of the app does not need
  redesign

Definition of done:

- the app can execute a run through OpenAI from the server side
- completed provider output becomes a normal completed run step
- provider errors surface clearly to the conductor and UI

Suggested branch:

- `feature/implement-openai-provider`

### Task 3: Add Structured Output Enforcement

Purpose:
make model responses reliable enough for the existing workflow and UI

Scope:

- define the expected result schema for provider output
- map OpenAI output into `summary`, `response`, `risks`, and `nextStep`
- reject malformed or partial responses cleanly
- keep output handling compatible with the current markdown artifact format

Definition of done:

- OpenAI-backed runs produce the expected structured fields
- malformed output fails clearly instead of creating partial run state
- the UI can render OpenAI-backed results using the existing output path

Suggested branch:

- `feature/add-openai-structured-output`

### Task 4: Document OpenAI Setup And Secret Handling

Purpose:
make local usage safe and understandable

Scope:

- document `OPENAI_API_KEY`
- document recommended provider selection flow
- document model configuration expectations
- document basic secret-handling guidance for local use and CI

Definition of done:

- a developer can configure the OpenAI provider without guessing
- the docs make clear that secrets stay in the backend environment, not the UI

Suggested branch:

- `docs/document-openai-provider-setup`

### Task 5: Add Non-Live Tests For OpenAI Provider Behavior

Purpose:
verify the provider path without making CI depend on live external calls

Scope:

- test config parsing and validation
- test output mapping and malformed output handling
- stub or mock the OpenAI client in automated tests
- keep CI deterministic

Definition of done:

- OpenAI provider behavior is covered by tests
- CI does not require a real OpenAI API key
- existing deterministic tests continue to pass

Suggested branch:

- `test/add-openai-provider-coverage`

### Task 6: Perform Manual Real-Provider Validation

Purpose:
confirm the full app works with a real hosted provider, not just mocked tests

Scope:

- run the app locally with `AGENT_PROVIDER=openai`
- execute at least one Independent run and one Relay run
- inspect UI results, DB state, and generated markdown artifacts
- confirm failure handling remains understandable

Definition of done:

- a real OpenAI-backed run completes locally
- the app remains usable with existing history, artifact, and output views
- major quality or config gaps are documented before broader use

Suggested branch:

- `chore/validate-openai-provider`

## Recommended Execution Order

1. Define OpenAI provider config
2. Implement OpenAIAgentProvider
3. Add structured output enforcement
4. Add non-live tests for OpenAI provider behavior
5. Document OpenAI setup and secret handling
6. Perform manual real-provider validation

This order is deliberate:

- config should exist before adding a new provider path
- the provider implementation is easier once config rules are explicit
- structured output handling should be tightened before calling the integration
  reliable
- tests should lock in the provider behavior before live validation
- docs should reflect the real final config shape
- manual validation should happen after the implementation and docs stabilize

## Risks And Watchpoints

- secrets must not be exposed to the browser or committed into the repo
- provider costs and rate limits can affect the user experience if not
  understood
- model output can still vary, so strict result mapping matters
- CI must not depend on live external calls
- prompt quality may need iteration even after the provider technically works

## Acceptance Criteria For Milestone 5

Milestone 5 is complete when:

- the app supports `AGENT_PROVIDER=openai`
- OpenAI calls are made from the backend provider layer, not the browser
- API key and model configuration are documented and validated
- OpenAI-backed output is converted into the app's structured result shape
- deterministic CI still passes without a live OpenAI dependency
- at least one real local OpenAI-backed run has been validated manually

## Likely First Implementation Branch

The best first implementation branch is:

- `feature/add-openai-provider-config`

Reason:

- it defines the config boundary the rest of the milestone depends on
- it is small, reviewable, and low-risk
- it keeps the later provider implementation focused on runtime behavior
- it surfaces early questions around environment variables before adding API
  code
