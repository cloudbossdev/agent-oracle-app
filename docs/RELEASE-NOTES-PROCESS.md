# Release Notes Process

## Purpose

This document defines the lightweight release-notes process for
`agent-oracle-app`.

The goal is simple:

- keep milestone-level release history understandable
- avoid relying only on PR archaeology
- avoid introducing heavy documentation overhead

## Scope

Use release notes for:

- stable tagged releases
- milestone completion points
- meaningful recovery/reference versions

Do not use release notes for:

- every small merge
- temporary experiment branches
- work that never became part of a stable baseline

## Where Release Notes Live

Release notes should be stored in:

- `docs/releases/`

Recommended filename pattern:

- `v0.3.0.md`
- `v0.4.0.md`

This keeps the notes aligned directly with tags.

## When To Create Release Notes

Create release notes when:

1. a milestone is accepted as complete
2. the release tag is created or about to be created
3. the version is intended to be a stable reference point

Recommended sequence:

1. confirm milestone completion
2. update or create release notes
3. create and push the tag
4. optionally mirror the notes into a GitHub Release entry

## Release Notes Template

Each release note should be short and practical.

Use this structure:

```md
# v0.3.0

## Summary

Short description of what this release represents.

## Included

- major change 1
- major change 2
- major change 3

## Validation

- `npm test`
- browser smoke coverage if applicable

## Notes

- any important caveat, migration note, or operational reminder
```

## Writing Guidelines

- write for future maintainers, not marketing
- focus on what materially changed
- keep it short enough to scan quickly
- prefer milestone-level summaries over file-level churn
- mention validation if it matters for trust or rollback

## Practical Rule

If a future version of you asks:

- "what changed in this stable version?"
- "why would I roll back to this tag?"
- "what milestone did this version represent?"

the release note should answer those questions quickly.

## Relationship To Tags

- every stable tag should have matching release notes
- release notes should use the same version label as the tag
- if a tag is renamed or replaced before publication, update the note to match

## Relationship To GitHub Releases

GitHub Releases are optional for this repo.

If they are used:

- the tag remains the source-of-truth version marker
- the release note in `docs/releases/` remains the durable repo copy
- the GitHub Release body can reuse or summarize the same content

## Minimal Standard For This Repo

For `agent-oracle-app`, the minimum acceptable release-notes discipline is:

- one markdown file per stable tagged release
- stored under `docs/releases/`
- created for milestone-level stable versions

This is intentionally lightweight and enough for the current project size.

## Related Documents

- [RELEASE-AND-ROLLBACK.md](./RELEASE-AND-ROLLBACK.md)
- [MILESTONE-4-PLAN.md](./MILESTONE-4-PLAN.md)
