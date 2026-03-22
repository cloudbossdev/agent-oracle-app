# Release And Rollback Guide

## Purpose

This document describes the safe release and rollback workflow for
`agent-oracle-app`.

Use it when:

- preparing a stable milestone release
- tagging a known-good version
- inspecting an older version
- undoing a bad change on `main`

This guide is intentionally lightweight. It is meant to make recovery and
release handling explicit, not bureaucratic.

## Core Principles

- `main` is the stable branch.
- Releases should come from a clean, green `main`.
- Prefer small, reviewable pull requests over large release batches.
- Prefer safe history-preserving rollback with `git revert`.
- Do not rewrite shared history unless there is a compelling and explicit
  reason.

## Terms

`release`
- A named stable version of the project that you want to be able to find again.

`tag`
- A named marker attached to a specific commit.
- Tags are how stable versions should be labeled.

`rollback`
- Returning to a prior known-good state after a bad change.

`revert`
- Creating a new commit that undoes an earlier commit.
- This is the normal rollback tool for shared history on `main`.

## Release Readiness Checklist

Before creating a release tag:

1. Confirm the relevant milestone or task set is complete.
2. Confirm all intended changes are merged into `main`.
3. Confirm `main` is clean locally:
   ```bash
   git status
   ```
4. Confirm local `main` matches GitHub:
   ```bash
   git checkout main
   git pull --ff-only origin main
   ```
5. Confirm CI is green for the most recent merged state.
6. Run local validation if appropriate:
   ```bash
   npm test
   ```

If any of those fail, do not tag a release yet.

## Release Tagging Pattern

Use semantic-style milestone tags:

- `v0.1.0`
- `v0.2.0`
- `v0.3.0`

Optional suffixes are fine for internal clarity when needed:

- `v0.3.0-milestone-3`
- `v0.4.0-beta`

Recommended rule:

- use plain `vX.Y.Z` for accepted stable releases
- use suffixes only when you need a clearly non-final marker

For this repo, the practical baseline mapping is:

- `v0.1.0` -> accepted MVP baseline
- `v0.2.0` -> real provider integration baseline
- `v0.3.0` -> user workflow and UX baseline

That means the first stable tag to create after Milestone 3 is:

- `v0.3.0`

## How To Create A Release Tag

From updated `main`:

```bash
git checkout main
git pull --ff-only origin main
git tag v0.3.0
git push origin v0.3.0
```

What this does:

- ensures you are on the latest stable `main`
- creates a local tag on the current commit
- pushes that tag to GitHub

After pushing the tag, optionally create a GitHub release note entry if the
project is using release notes for that milestone.

For the current repo state, once the tagging rule is merged into `main`, the
recommended first stable tag is:

```bash
git checkout main
git pull --ff-only origin main
git tag v0.3.0
git push origin v0.3.0
```

Reason:

- Milestone 3 is the latest completed product milestone
- Milestone 4 is still in progress
- `v0.3.0` gives the project its first named stable recovery point after the
  user-facing workflow improvements

## How To Inspect An Older Version

If you want to inspect a prior release or commit without changing shared
history:

```bash
git checkout v0.3.0
```

or:

```bash
git checkout <commit-hash>
```

This places Git in a detached `HEAD` state.

Meaning:

- you are viewing an old version directly
- you should not do normal ongoing work here unless you create a new branch

To return to normal work:

```bash
git checkout main
```

## Safe Rollback On `main`

For normal shared-history rollback, use `git revert`.

Example for one bad commit:

```bash
git checkout main
git pull --ff-only origin main
git revert <bad-commit-hash>
git push origin main
```

What this does:

- keeps history intact
- records that a change was undone
- avoids rewriting public history

This is the preferred rollback method for this repo.

## Rolling Back A Pull Request

If a merged PR introduced a problem, identify the merge commit on `main` and
revert it.

Example workflow:

1. Find the merge commit in Git history or on GitHub.
2. Revert that merge commit or the specific bad commits it introduced.
3. Run validation again.
4. Push the revert.

Use care when reverting merge commits. If the rollback is not straightforward,
revert the individual bad commits instead of forcing a risky history rewrite.

## When Not To Use Destructive History Changes

Avoid commands like:

- `git reset --hard` on shared branch history
- force-pushing rewritten `main`
- deleting published history to "clean things up"

Those can make recovery harder, not easier.

For this repo, the default safe rule is:

- shared branch problem -> revert
- local unshared experiment -> clean up locally if needed

## Practical Recovery Sequence

If a newly merged change breaks the project:

1. Confirm what changed.
2. Confirm the last known-good commit or tag.
3. Decide whether the problem should be fixed forward or reverted.
4. If fast safe fix is not obvious, revert the bad change on `main`.
5. Open a follow-up branch/PR for the proper fix.

This keeps `main` stable while investigation continues.

## Recommended Release Habit

For this repo:

- tag after meaningful milestone completion
- do not tag every small merge
- keep milestone plan, release tag, and release notes aligned

That gives you:

- cleaner rollback points
- clearer project history
- easier milestone-to-milestone comparison

## Related Documents

- [WORKFLOW.md](./WORKFLOW.md)
- [ROADMAP.md](./ROADMAP.md)
- [MILESTONE-4-PLAN.md](./MILESTONE-4-PLAN.md)
