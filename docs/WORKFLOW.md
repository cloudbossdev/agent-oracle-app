# Development Workflow

## Purpose

This document describes the working Git and GitHub process for
`agent-oracle-app`.

Use it as the default operating pattern for starting, reviewing, and merging
work.

## Core Rules

- `main` is the stable branch.
- Do not develop directly on `main` unless handling an explicit emergency fix.
- Create one branch per task.
- Keep pull requests focused on one purpose.
- Prefer small, reviewable commits and pull requests.
- Merge only after review and passing CI checks.

## Branch Types

- `feature/*`
  Use for new product or system behavior.
- `fix/*`
  Use for bug fixes and behavior corrections.
- `chore/*`
  Use for tooling, maintenance, CI, or repo operations.
- `docs/*`
  Use for documentation-only changes.

Examples:

- `feature/real-provider-integration`
- `fix/windows-sqlite-cli-resolution`
- `chore/add-github-actions-ci`
- `docs/update-local-setup-guide`

## Standard Task Flow

1. Start from updated `main`.
2. Create a new branch for one task.
3. Make the change locally.
4. Run the relevant validation locally.
5. Stage only the intended files.
6. Commit with a clear message.
7. Push the branch to GitHub.
8. Open a pull request into `main`.
9. Let CI run on the pull request.
10. Merge only after the change is understood and checks are green.

## Common Commands

Create and switch to a new branch:
```bash
git checkout -b chore/add-github-actions-ci
```

Check current branch and file state:
```bash
git status
```

Stage files for the next commit:
```bash
git add README.md
```

Create a commit:
```bash
git commit -m "Improve local setup documentation"
```

Push the branch to GitHub:
```bash
git push -u origin docs/update-local-setup-guide
```

Return to `main` and update it after a merge:
```bash
git checkout main
git pull --ff-only origin main
```

## Pull Requests

A pull request, or PR, is the request to merge one branch into another.

For this project:

- most PRs should target `main`
- the PR title should match the task clearly
- the PR body should explain what changed, why it changed, and how it was
  validated

Good PR traits:

- focused scope
- clear purpose
- clean diff
- passing CI

## CI Expectations

The repository uses GitHub Actions for automated validation.

Current expectation:

- pull requests should pass the `CI` workflow before merge
- pushes to `main` also run the same validation workflow

At minimum, expect:

- dependency install
- test execution through `npm test`

## Planning Relationship

Work should flow through these layers:

1. roadmap
2. milestone plan
3. task
4. branch
5. pull request
6. merge into `main`

Use:

- [ROADMAP.md](./ROADMAP.md) for project direction
- [MILESTONE-1-PLAN.md](./MILESTONE-1-PLAN.md) for current milestone planning

## Practical Guidance

- If a change mixes unrelated concerns, split it.
- If a branch starts to drift from its original purpose, stop and narrow scope.
- If CI fails, fix the branch before merge.
- If you are unsure what changed, run `git status` first.
- If local and remote state seem inconsistent, verify with:
  - `git status`
  - `git rev-parse HEAD`
  - `git log --oneline --decorate -n 5`

