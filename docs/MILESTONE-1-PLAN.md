# Milestone 1 Plan: Baseline And CI

## Goal

Make the current MVP operationally stable and repeatable for development by
documenting setup assumptions and adding automated validation for pull requests.

## Why This Milestone Comes First

The project now has an accepted baseline on `main`, but it still depends on
manual knowledge for setup and pull request validation. Before adding larger
features, the repo should be easy to bootstrap and easy to validate.

## Deliverables

1. Automated CI runs build and tests for pull requests and pushes to `main`.
2. Setup documentation accurately describes the current local requirements.
3. Environment assumptions are explicit, especially Node and SQLite behavior.
4. The current development workflow is documented well enough to reduce
   ambiguity when starting new work.

## Tasks

### Task 1: Add GitHub Actions CI

Purpose:
run automated validation on every pull request and on changes merged to `main`

Scope:

- add a GitHub Actions workflow
- install dependencies
- run `npm test`

Definition of done:

- a PR shows a CI check in GitHub
- successful builds pass automatically
- failing tests fail the workflow

Suggested branch:

- `chore/add-github-actions-ci`

### Task 2: Tighten Local Setup Documentation

Purpose:
make local bootstrap reproducible without relying on memory or chat history

Scope:

- document required local tools
- document install and run steps
- document SQLite expectations on Windows
- document how the project uses `APP_DB_PATH` and `SQLITE3_PATH`

Definition of done:

- a new developer can follow the README to run the app and tests
- environment-variable behavior is described accurately

Suggested branch:

- `docs/update-local-setup-guide`

### Task 3: Document Branch And PR Workflow

Purpose:
make the project management workflow explicit so future work follows a stable
pattern

Scope:

- document branch naming conventions
- document commit / push / PR expectations
- document the role of `main`

Definition of done:

- the repo contains a short, usable contribution workflow reference
- future work can be started without re-explaining the basic process

Suggested branch:

- `docs/add-workflow-guide`

### Task 4: Decide Milestone 2 Provider Direction

Purpose:
reduce ambiguity before implementation starts on real provider integration

Scope:

- decide the initial real provider target
- define whether `agents/*.md` become runtime source-of-truth instructions
- define required config inputs for the provider

Definition of done:

- a written decision exists for the first real provider approach
- Milestone 2 can be planned with less ambiguity

Suggested branch:

- planning task, not necessarily a code branch until implementation begins

## Recommended Execution Order

1. Add GitHub Actions CI
2. Tighten local setup documentation
3. Document branch and PR workflow
4. Decide Milestone 2 provider direction

This order is deliberate:

- CI gives immediate validation value for every later branch
- setup documentation reduces repeated onboarding confusion
- workflow documentation makes project operations repeatable
- provider direction should be decided before Milestone 2 work starts

## Acceptance Criteria For Milestone 1

Milestone 1 is complete when:

- CI runs automatically for pull requests
- the README and supporting docs accurately describe local setup
- the development workflow is documented in a lightweight, durable way
- the first real provider direction is decided clearly enough to plan
  Milestone 2

## Notes

- Keep Milestone 1 narrow.
- Do not start real provider implementation inside this milestone.
- Prefer small PRs, one task per branch.

