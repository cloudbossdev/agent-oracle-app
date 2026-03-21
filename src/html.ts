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
    <h1>Local Multi-Agent Review Workbench</h1>
    <p class="muted">Single-user local MVP with deterministic orchestration, SQLite storage, markdown artifacts, and polling.</p>
    <div class="grid">
      <section class="panel">
        <h2>Question</h2>
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
        <div id="history" class="stack"></div>
      </section>
    </div>
    <section class="panel top-gap">
      <h2>Current Run</h2>
      <div id="runMeta" class="muted">No run selected.</div>
      <div id="steps"></div>
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
