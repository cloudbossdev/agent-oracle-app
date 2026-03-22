# Milestone 4 Plan: Operational Hardening

## Goal

Make the project easier to maintain, test, release, and recover by adding
release discipline, rollback guidance, and stronger regression detection around
the now-real execution path and richer UI.

## Why This Milestone Comes Next

Milestones 1 through 3 turned the repo into a stable working product:

- the repo has CI and workflow discipline
- the app can execute a real shell-backed provider
- the UI now exposes status, artifacts, history, and structured outputs clearly

The next risk is no longer missing product capability. It is operational drift:

- regressions are still mostly caught by unit/integration tests plus ad hoc UI
  checks
- release and rollback discipline is not yet explicit
- there is no browser-level automated smoke coverage for the main user flow

Milestone 4 closes those gaps.

## Current Operational Gaps

Based on the current repo and workflow:

- there is no documented release tagging process
- rollback guidance is still implicit rather than written down
- UI regressions still rely on manual browser checks
- no changelog or release-note discipline exists yet
- the README describes local usage well, but operational recovery is still thin

## Deliverables

1. The project has a documented release and rollback process.
2. Stable milestones can be tagged consistently.
3. The repo has browser-level smoke coverage for the core user workflow.
4. Critical regression points are covered beyond the current backend-only tests.
5. Operational guidance exists for validating, releasing, and recovering the
   app safely.

## Tasks

### Task 1: Document Release And Rollback Workflow

Purpose:
make recovery and release handling explicit instead of memory-based

Scope:

- document how to cut a release tag
- document how to inspect prior versions
- document when to use `git revert`
- document the expected safe rollback pattern for this repo

Definition of done:

- the repo contains a short release and rollback guide
- a developer can follow the guide without guessing the Git flow

Suggested branch:

- `docs/add-release-and-rollback-guide`

### Task 2: Add Release Tagging Discipline

Purpose:
make stable milestones recoverable by name, not only by commit hash

Scope:

- define tag naming convention
- create the first stable milestone tag after agreement
- document when tags should be created

Definition of done:

- release tags have a documented pattern
- the current stable milestone can be tagged consistently

Suggested branch:

- `chore/document-release-tagging`

### Task 3: Add Browser-Level Smoke Tests

Purpose:
catch regressions in the main user workflow that current backend tests cannot
see

Scope:

- add a browser automation toolchain
- cover at least the main happy-path user workflow
- keep the suite lightweight and CI-appropriate

Definition of done:

- a browser smoke test can start the app, create a run, and verify visible UI
  outcomes
- the test is runnable locally and in CI

Suggested branch:

- `test/add-browser-smoke-tests`

### Task 4: Add CI Coverage For Browser Smoke Tests

Purpose:
make browser-level regression checks part of the normal PR gate

Scope:

- update GitHub Actions for browser test execution
- keep CI runtime reasonable
- make failures visible in PR checks

Definition of done:

- pull requests run both backend validation and browser smoke validation
- CI remains understandable and maintainable

Suggested branch:

- `chore/add-browser-test-ci`

### Task 5: Add Lightweight Release Notes Or Changelog Discipline

Purpose:
make milestone-to-milestone changes easier to understand later

Scope:

- choose a lightweight changelog or release-notes pattern
- document what should be recorded at release time
- avoid heavy process overhead

Definition of done:

- there is a durable place to record milestone-level release notes
- future releases do not depend on memory or PR archaeology alone

Suggested branch:

- `docs/add-release-notes-process`

## Recommended Execution Order

1. Document release and rollback workflow
2. Add release tagging discipline
3. Add browser-level smoke tests
4. Add CI coverage for browser smoke tests
5. Add lightweight release notes or changelog discipline

This order is deliberate:

- the repo should define release safety before formalizing release artifacts
- tagging discipline is easier once the release process is explicit
- browser smoke coverage should be built locally before wiring it into CI
- CI changes should follow a working smoke suite
- release notes are most useful once release handling is no longer informal

## Risks And Watchpoints

- browser automation can become brittle if it overreaches beyond a smoke-test
  scope
- CI time can grow too quickly if the browser suite is not kept narrow
- release process docs should be lightweight enough to actually use
- tagging should follow meaningful stable points, not every trivial merge

## Acceptance Criteria For Milestone 4

Milestone 4 is complete when:

- the repo has a documented release and rollback guide
- stable project versions can be tagged consistently
- browser-level smoke coverage exists for the main user flow
- PR validation includes the most important regression checks for both backend
  and UI behavior
- operational recovery no longer depends on tribal knowledge

## Likely First Implementation Branch

The best first implementation branch is:

- `docs/add-release-and-rollback-guide`

Reason:

- it defines the operational rules the rest of the milestone depends on
- it is low-risk and easy to review
- it makes later tagging and rollback work clearer
- it closes an important process gap before adding more automation
