# Agent Oracle App Roadmap

## Purpose

This roadmap defines the current project direction for `agent-oracle-app`.
It is the high-level planning reference for:

- what the product is intended to become
- which milestones come next
- what order work should happen in
- what is intentionally deferred

This document should stay stable at the milestone level and change only when
the project direction, scope, or sequencing changes.

## Product Goal

Build a reliable local multi-agent review workbench that lets a user submit a
question, run a structured review workflow, store results locally, inspect
outputs and history, and evolve the system safely through testing and controlled
release practices.

## Current Baseline

- `main` contains the accepted MVP baseline
- the app runs a fixed four-agent workflow
- runs are stored in SQLite and mirrored to markdown artifacts
- the default execution path still uses a deterministic mock provider
- local automated tests verify core workflow, persistence, and artifact behavior

## Milestones

### Milestone 1: Baseline And CI

Goal:
make the current MVP operationally stable and repeatable for day-to-day
development

Focus:

- environment clarity
- setup reliability
- automated validation on every change
- documentation of current assumptions

Success looks like:

- a developer can clone the repo and follow documented setup steps
- pull requests run automated build and test validation
- `main` remains a known-good branch

### Milestone 2: Real Provider Integration

Goal:
replace the mock execution path with real agent execution

Focus:

- provider selection strategy
- runtime use of agent instructions
- configuration and error handling
- preserving deterministic testability where useful

Success looks like:

- the app can execute real agent work instead of mock output
- provider configuration is explicit and documented
- failed runs produce understandable state and errors

### Milestone 3: User Workflow And UX

Goal:
make the application clearer and more useful for real users

Focus:

- run history clarity
- output readability
- artifact inspection
- better status and failure visibility

Success looks like:

- a user can run a review and understand what happened without reading code
- the UI makes run state, outputs, and failures understandable

### Milestone 4: Operational Hardening

Goal:
make the project easier to maintain, test, release, and recover

Focus:

- release and rollback discipline
- stronger regression detection
- browser-level smoke coverage
- operational documentation

Success looks like:

- the project has a documented release and rollback process
- critical regressions are easier to catch before merge
- stable milestones can be tagged and recovered cleanly

## Planned Sequence

1. Baseline And CI
2. Real Provider Integration
3. User Workflow And UX
4. Operational Hardening

This order is intentional:

- first make the repo safe to work in
- then make the core engine real
- then improve the user-facing experience
- then harden long-term operations

## Current Non-Goals

These items are intentionally not treated as immediate roadmap priorities:

- multi-user support
- authentication
- cloud deployment
- production-scale infrastructure
- broad plugin/provider abstraction beyond what the next provider milestone needs

## Planning Rules

- The roadmap should stay high level.
- Detailed task planning belongs in milestone-specific planning documents.
- Work should flow from milestone -> task -> branch -> pull request.
- `main` should remain the stable branch.

