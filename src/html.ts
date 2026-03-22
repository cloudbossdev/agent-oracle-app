// @ts-nocheck
export function renderIndexHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Local Multi-Agent Review Workbench</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="container">
    <header class="page-header">
      <div>
        <p class="eyebrow">Agent Oracle App</p>
        <h1>Local Multi-Agent Review Workbench</h1>
        <p class="muted intro">Single-user local review workflow with SQLite-backed history, markdown artifacts, and live run polling.</p>
      </div>
    </header>
    <div class="grid">
      <section class="panel">
        <h2>Question</h2>
        <p class="panel-copy muted">Submit one question and run the fixed four-agent review workflow in independent or relay mode.</p>
        <textarea id="question">How should I build a local project planning tool on my laptop?</textarea>
        <div class="controls">
          <label>
            <span class="muted">Workflow mode</span>
            <select id="mode">
              <option value="independent">Independent</option>
              <option value="relay">Relay</option>
            </select>
          </label>
          <button id="runButton">Run Review</button>
        </div>
      </section>
      <section class="panel">
        <h2>Run History</h2>
        <p class="panel-copy muted">Reopen earlier runs to compare status, question text, and final outputs.</p>
        <div id="history" class="stack"></div>
      </section>
    </div>
    <section class="panel top-gap">
      <h2>Current Run</h2>
      <div id="runState" class="empty-state">No run selected yet. Start a run or reopen one from history.</div>
      <div id="runSummary" class="run-summary hidden">
        <div class="summary-row">
          <div>
            <div id="runMeta" class="summary-title"></div>
            <div id="runQuestion" class="muted summary-question"></div>
          </div>
          <div id="runBadge" class="status-badge">Queued</div>
        </div>
        <div class="summary-row compact">
          <div id="runProgress" class="muted"></div>
          <div id="runTiming" class="muted"></div>
        </div>
        <div id="runError" class="error-banner hidden"></div>
      </div>
      <div id="steps" class="steps-list"></div>
    </section>
    <section class="panel top-gap">
      <h2>Final Synthesis</h2>
      <pre id="finalOutput" class="empty">Mosaic output will appear here after prior steps complete.</pre>
    </section>
  </main>
  <script type="module" src="/app.js"></script>
</body>
</html>`;
}
