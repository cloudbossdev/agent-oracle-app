// @ts-nocheck
export function renderIndexHtml(providerView) {
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
        <p class="panel-copy muted">Submit one question and run the fixed four-agent review workflow. Choose the mode based on whether reviewer steps should stay independent or build on each other.</p>
        <div class="info-strip">
          <div class="info-chip">
            <span class="info-label">Current provider</span>
            <strong>${providerView.label}</strong>
          </div>
          <div class="muted info-copy">${providerView.copy}</div>
        </div>
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
        <div class="mode-guide">
          <div class="mode-card">
            <div class="mode-title">Independent</div>
            <p class="muted">Atlas, Sage, and Nova each answer from the original question only. Use this when you want parallel viewpoints without handoff bias.</p>
          </div>
          <div class="mode-card">
            <div class="mode-title">Relay</div>
            <p class="muted">Sage builds on Atlas, Nova builds on Sage, and Mosaic closes with the full chain. Use this when you want a deliberate step-by-step review.</p>
          </div>
        </div>
      </section>
      <section class="panel">
        <h2>Run History</h2>
        <p class="panel-copy muted">Reopen earlier reviews to compare questions, statuses, and the final synthesis from each saved run.</p>
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
    </section>
    <section class="panel top-gap">
      <h2>Final Synthesis</h2>
      <div id="finalSynthesisCard" class="synthesis-card hidden">
        <div class="synthesis-header">
          <div>
            <div id="finalSynthesisAgent" class="synthesis-agent"></div>
            <div id="finalSynthesisSummary" class="synthesis-summary"></div>
          </div>
          <div id="finalSynthesisStatus" class="status-badge small"></div>
        </div>
        <div id="finalSynthesisResponse" class="synthesis-section"></div>
        <div class="synthesis-grid">
          <div id="finalSynthesisRisks" class="synthesis-section"></div>
          <div id="finalSynthesisNextStep" class="synthesis-section"></div>
        </div>
      </div>
      <pre id="finalOutput" class="empty">Mosaic's final synthesis will appear here after the reviewer steps finish.</pre>
    </section>
    <section class="panel top-gap">
      <div class="details-header">
        <div>
          <h2>Agent Outputs</h2>
          <p class="panel-copy muted">Switch between reviewer outputs without scrolling through every agent in sequence.</p>
        </div>
        <div class="details-tabs">
          <button id="tabAtlas" class="tab-button selected" data-agent="atlas">Atlas</button>
          <button id="tabSage" class="tab-button" data-agent="sage">Sage</button>
          <button id="tabNova" class="tab-button" data-agent="nova">Nova</button>
          <button id="tabMosaic" class="tab-button" data-agent="mosaic">Mosaic</button>
        </div>
      </div>
      <div id="agentOutputEmpty" class="empty-state small">Start a run or reopen one from history to inspect agent outputs.</div>
      <div id="agentOutputPanel" class="step-card hidden">
        <div class="step-header">
          <div>
            <div id="agentOutputName" class="step-title"></div>
            <div id="agentOutputRole" class="muted"></div>
          </div>
          <span id="agentOutputStatus" class="status-badge"></span>
        </div>
        <div class="step-meta">
          <span id="agentOutputStarted"></span>
          <span id="agentOutputCompleted"></span>
        </div>
        <div id="agentOutputBody"></div>
      </div>
    </section>
    <section class="panel top-gap">
      <div id="artifactPanel" class="artifact-panel hidden">
        <div class="artifact-panel-header">
          <div>
            <h3>Run Artifacts</h3>
            <p class="muted artifact-copy">These are the markdown and manifest files generated for the selected review run.</p>
          </div>
        </div>
        <div id="artifactList" class="artifact-list"></div>
      </div>
      <div id="steps" class="steps-list hidden"></div>
    </section>
  </main>
  <script type="module" src="/app.js"></script>
</body>
</html>`;
}
