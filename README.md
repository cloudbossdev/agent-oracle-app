# Local Multi-Agent Review Workbench (MVP v1)

A simple local-only TypeScript web app that runs a fixed four-agent review workflow, stores runs in SQLite, writes readable markdown artifacts, and shows live progress via polling.

## Brief implementation plan
1. Serve one local web page with a question form, mode selector, progress cards, final synthesis, and run history.
2. Use a deterministic `Conductor` module to create runs, construct step inputs, execute fixed-order agents, and persist outputs.
3. Store source-of-truth run data in SQLite and mirror readable artifacts to per-run markdown files.
4. Use a deterministic mock provider so the full workflow is testable without external services.

## Assumptions
- This is a single-user tool running on one machine.
- SQLite is available locally via the `sqlite3` CLI.
- Node.js and npm are available locally.
- The app does not need authentication, multi-user coordination, or network services beyond local HTTP.

## Proposed stack
- **Server:** Node.js built-in `http` server.
- **Frontend:** plain HTML/CSS/JavaScript served by the local server.
- **Language:** TypeScript.
- **Database:** SQLite via the local `sqlite3` CLI.
- **Tests:** Node built-in test runner.

## Files created / modified
- `src/server.ts` - local HTTP server and API routes.
- `src/conductor.ts` - deterministic workflow orchestrator.
- `src/db.ts` and `src/sqlite.ts` - SQLite schema and persistence helpers.
- `src/artifacts.ts` - per-run folder and markdown artifact generation.
- `src/provider.ts` - mock provider and placeholder shell provider.
- `src/workflow.ts` - independent vs relay input construction.
- `src/html.ts`, `public/app.js`, and `public/styles.css` - UI and polling behavior.
- `agents/*.md` - concise instruction files for Atlas, Sage, Nova, and Mosaic.
- `tests/*.test.ts` - unit and integration coverage.

## Code implementation
### Core behavior
- The UI allows entering one question, selecting **Independent** or **Relay**, and starting a run.
- The backend creates a run row, run step rows, a run folder, `question.md`, `manifest.json`, and per-agent input/output markdown files.
- The Conductor executes Atlas → Sage → Nova → Mosaic in a strict fixed order.
- In **Independent** mode, the reviewer agents use only the original question.
- In **Relay** mode, Sage uses Atlas output as primary prior context and Nova uses Sage output as primary prior context.
- Mosaic always receives the original question plus all prior outputs.
- The frontend polls `/api/runs/:id` every second and updates step status cards and final synthesis.
- Run history is persisted and can be reopened from the main page.

### Markdown artifact format
Each generated input file contains:
- Run ID
- Agent name
- Role
- Workflow mode
- Original question
- Prior context
- Task

Each generated output file contains:
- Agent
- Run ID
- Status
- Summary
- Response
- Risks / Caveats
- Recommended Next Step

### Run folder layout
Example output:
```text
runs/
  2026-03-21_001/
    question.md
    manifest.json
    atlas-input.md
    atlas-output.md
    sage-input.md
    sage-output.md
    nova-input.md
    nova-output.md
    mosaic-input.md
    mosaic-output.md
```

## Tests
### Automated tests
Run:
```bash
npm test
```

Covered checks:
- workflow mode input construction
- run folder creation
- required statuses
- SQLite persistence layer
- end-to-end independent mode execution with mock provider
- end-to-end relay mode execution with mock provider
- markdown artifact creation
- final synthesis persistence

## Local setup
### Prerequisites
- Node.js 24 or newer
- npm
- SQLite CLI (`sqlite3`)

### Install dependencies
Run:
```bash
npm install
```

### SQLite notes
- The app and tests require the `sqlite3` command-line tool.
- On Windows, installing SQLite with `winget install SQLite.SQLite` is the simplest path.
- The app will try to find `sqlite3` automatically on Windows, including common WinGet install paths.
- If automatic detection is not sufficient, set `SQLITE3_PATH` to the full path of `sqlite3.exe`.

### Environment variables
- `APP_DB_PATH`
  Overrides the SQLite database file path. If not set, the app uses `app.db` in the project root.
- `SQLITE3_PATH`
  Overrides the SQLite CLI executable path. Use this when `sqlite3` is installed in a non-standard location.
- `PORT`
  Overrides the HTTP port. If not set, the app listens on `3000`.

PowerShell examples:
```powershell
$env:APP_DB_PATH = "C:\Projects\the-oracle\scratch.db"
$env:SQLITE3_PATH = "C:\path\to\sqlite3.exe"
$env:PORT = "3001"
```

Remove an override in the current shell:
```powershell
Remove-Item Env:APP_DB_PATH
```

## Run locally
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Build the TypeScript sources:
   ```bash
   npm run build
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` unless `PORT` is overridden.
5. Enter a question, choose **Independent** or **Relay**, and click **Run Review**.
6. Watch progress update live in the UI. Inspect generated run folders in `runs/` and the SQLite database in `app.db` or the path from `APP_DB_PATH`.

### Development shortcut
```bash
npm run dev
```

### Verify local setup
Run:
```bash
npm test
```

This confirms:
- TypeScript compilation succeeds
- SQLite is available to the test runner
- workflow, persistence, and artifact tests pass

### Manual validation checklist
- Start the app locally.
- Submit an **Independent** run and confirm Atlas, Sage, Nova, and Mosaic move through statuses and finish.
- Submit a **Relay** run and confirm Sage/Nova input files include primary prior context from the preceding agent.
- Confirm `app.db` or the configured `APP_DB_PATH` contains rows for `runs`, `agents`, `run_steps`, and `artifacts`.
- Confirm the filesystem contains the expected per-run markdown files.
- Reopen an older run from history and inspect stored outputs.

### How to replace the mock provider later
1. Implement the `AgentProvider` interface in `src/types.ts`.
2. Add a real provider module beside `src/provider.ts`.
3. Swap the provider in `src/conductor.ts` with `setAgentProvider(...)` or change the default provider assignment.
4. Keep the Conductor unchanged so the same SQLite records, markdown files, and polling UI continue to work.

## Validation results
- Automated tests verify the required workflow, storage, and artifact behavior.
- The mock provider adds small deterministic delays so progress is visible in the UI.
- The app is fully runnable locally without cloud services or external APIs.

## Remaining limitations
- The shell provider is only a placeholder for future real CLI-backed integration.
- The UI is intentionally basic for MVP clarity.
- The implementation uses the local `sqlite3` CLI instead of a Node SQLite package to avoid external dependency setup.
