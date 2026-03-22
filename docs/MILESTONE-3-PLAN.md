# Milestone 3 Plan: User Workflow And UX

## Goal

Make the application clearer and more useful for real users by improving how
they start runs, inspect progress, understand failures, and review stored
outputs.

## Why This Milestone Comes Next

Milestone 2 made the provider path real, but the UI is still a thin MVP shell.
The current app can execute useful work, yet it still expects the user to infer
too much from raw status text, dense step cards, and filesystem knowledge.
Before moving into operational hardening, the product should become easier to
use directly.

## Current UX Gaps

Based on the current UI and API behavior:

- the run view is functional but visually dense
- run status and failure state are easy to miss
- artifact inspection still depends on knowing the `runs/` folder layout
- the history list is useful but shallow
- the app does not explain provider mode or run context clearly enough
- the final synthesis view is disconnected from the underlying step outputs

## Deliverables

1. The current run view makes status, timestamps, and failures easier to scan.
2. The UI exposes the most useful run artifacts without requiring filesystem
   guessing.
3. Run history is more informative and easier to reopen confidently.
4. The final synthesis and per-step outputs are easier to read and compare.
5. User-facing wording explains what happened during a run without requiring
   code knowledge.

## Tasks

### Task 1: Improve Current Run Status And Failure Visibility

Purpose:
make the active run understandable at a glance, especially during errors

Scope:

- make run-level status clearer
- visually distinguish pending, running, completed, and failed states
- make error text obvious when a step fails
- improve empty and loading states

Definition of done:

- a user can tell whether a run is healthy or failing within a few seconds
- failed steps are visually distinct from successful steps
- the page communicates when no run is selected yet

Suggested branch:

- `feature/improve-run-status-ux`

### Task 2: Expose Run Artifacts In The UI

Purpose:
make generated markdown artifacts discoverable without requiring manual folder
navigation

Scope:

- surface artifact file names or paths in the run view
- add API support if needed for artifact metadata
- make question, per-agent input/output, and manifest artifacts easier to find

Definition of done:

- a user can identify the key files generated for a run from the UI
- artifact access does not require prior knowledge of the `runs/` folder layout

Suggested branch:

- `feature/show-run-artifacts`

### Task 3: Improve Run History Clarity

Purpose:
make stored runs easier to scan, compare, and reopen later

Scope:

- improve history item summaries
- include more useful metadata such as provider mode or result summary where
  practical
- make the currently selected run more obvious
- improve history empty state wording

Definition of done:

- a user can quickly identify the run they want to reopen
- history items feel like records, not just buttons with raw text

Suggested branch:

- `feature/improve-run-history`

### Task 4: Improve Final Synthesis And Step Output Readability

Purpose:
make the main outputs easier to consume as review material instead of raw text
blocks

Scope:

- improve formatting of the final synthesis panel
- separate step summaries from longer responses where helpful
- make agent role and output easier to scan
- preserve readability on mobile and desktop

Definition of done:

- the final synthesis is easier to read than the current raw preformatted block
- step outputs are easier to compare without reading every line sequentially

Suggested branch:

- `feature/improve-output-readability`

### Task 5: Clarify User-Facing Workflow Wording

Purpose:
reduce confusion around workflow modes, provider behavior, and what the app is
actually doing

Scope:

- improve labels and helper text in the UI
- explain independent vs relay mode more clearly
- explain when mock vs shell execution is in effect if appropriate
- make run metadata more human-readable

Definition of done:

- a first-time user can understand the main controls without reading the code
- run metadata reads like product language, not internal implementation wording

Suggested branch:

- `feature/clarify-ui-workflow-wording`

## Recommended Execution Order

1. Improve current run status and failure visibility
2. Clarify user-facing workflow wording
3. Expose run artifacts in the UI
4. Improve run history clarity
5. Improve final synthesis and step output readability

This order is deliberate:

- status and failure visibility solve the most immediate usability gap
- wording improvements reduce confusion before deeper UI changes land
- artifact exposure unlocks a key current capability that still feels hidden
- run history improvements become more valuable once the active run view is
  clearer
- output readability is best refined after the key information architecture is
  in place

## Risks And Watchpoints

- UX work can easily turn into broad, vague redesign work if not scoped tightly
- artifact access should stay local-safe and not imply unsupported file-opening
  behavior
- output formatting changes should not make raw data harder to inspect
- UI wording should stay aligned with the actual execution model

## Acceptance Criteria For Milestone 3

Milestone 3 is complete when:

- a user can run a review and understand status and errors from the UI
- stored runs are easier to identify and reopen
- generated artifacts are discoverable from the app
- final outputs are materially easier to read than the MVP presentation
- the UI explains the main workflow concepts without relying on code-level
  knowledge

## Likely First Implementation Branch

The best first implementation branch is:

- `feature/improve-run-status-ux`

Reason:

- it addresses the highest-friction gap in the current app
- it is visible immediately to users
- it improves both the happy path and failure path
- it creates a stronger foundation for later history and output refinements
