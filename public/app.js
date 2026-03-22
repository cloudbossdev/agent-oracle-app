const questionInput = document.getElementById('question');
const modeInput = document.getElementById('mode');
const runButton = document.getElementById('runButton');
const historyEl = document.getElementById('history');
const runStateEl = document.getElementById('runState');
const runSummaryEl = document.getElementById('runSummary');
const runMetaEl = document.getElementById('runMeta');
const runQuestionEl = document.getElementById('runQuestion');
const runBadgeEl = document.getElementById('runBadge');
const runProgressEl = document.getElementById('runProgress');
const runTimingEl = document.getElementById('runTiming');
const runErrorEl = document.getElementById('runError');
const artifactPanelEl = document.getElementById('artifactPanel');
const artifactListEl = document.getElementById('artifactList');
const stepsEl = document.getElementById('steps');
const finalOutputEl = document.getElementById('finalOutput');

let activeRunId = null;
let pollTimer = null;

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function formatStatus(status) {
  return String(status).replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  return `status-${status}`;
}

function formatDateTime(value) {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function summarizeProgress(run) {
  const completed = run.steps.filter((step) => step.status === 'completed').length;
  const failed = run.steps.filter((step) => step.status === 'failed').length;
  const active = run.steps.filter((step) => step.status === 'running' || step.status === 'preparing').length;

  if (failed > 0) return `${completed}/${run.steps.length} steps completed | ${failed} failed`;
  if (active > 0) return `${completed}/${run.steps.length} steps completed | ${active} active`;
  return `${completed}/${run.steps.length} steps completed`;
}

function summarizeTiming(run) {
  const startedStep = run.steps.find((step) => step.started_at);
  const completedStep = [...run.steps].reverse().find((step) => step.completed_at);

  if (run.status === 'completed') {
    return `Completed ${formatDateTime(completedStep?.completed_at || run.updated_at)}`;
  }
  if (run.status === 'failed') {
    return `Failed ${formatDateTime(run.updated_at)}`;
  }
  if (startedStep) {
    return `Started ${formatDateTime(startedStep.started_at)}`;
  }
  return `Created ${formatDateTime(run.created_at)}`;
}

function describeWorkflowMode(mode) {
  return mode === 'relay'
    ? 'Relay review'
    : 'Independent review';
}

function setRunEmptyState(message) {
  runStateEl.textContent = message;
  runStateEl.className = 'empty-state';
  runSummaryEl.classList.add('hidden');
  artifactPanelEl.classList.add('hidden');
  artifactListEl.innerHTML = '';
  stepsEl.innerHTML = '';
}

function escapeHtml(input) {
  return String(input).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderStepCard(step) {
  const card = document.createElement('article');
  card.className = `step-card ${statusClass(step.status)}`;

  const bodyParts = [];
  if (step.output_text) {
    bodyParts.push(`
      <div class="step-section">
        <div class="section-label">Output</div>
        <pre>${escapeHtml(step.output_text)}</pre>
      </div>
    `);
  }
  if (step.error_text) {
    bodyParts.push(`
      <div class="step-section">
        <div class="section-label error-label">Error</div>
        <pre class="error-pre">${escapeHtml(step.error_text)}</pre>
      </div>
    `);
  }

  card.innerHTML = `
    <div class="step-header">
      <div>
        <div class="step-title">${step.step_order}. ${step.agent.display_name}</div>
        <div class="muted">${step.agent.role_name}</div>
      </div>
      <span class="status-badge ${statusClass(step.status)}">${formatStatus(step.status)}</span>
    </div>
    <div class="step-meta">
      <span>Started: ${formatDateTime(step.started_at)}</span>
      <span>Completed: ${formatDateTime(step.completed_at)}</span>
    </div>
    ${bodyParts.length ? bodyParts.join('') : '<div class="muted">No output recorded yet for this step.</div>'}
  `;

  return card;
}

function formatArtifactType(type) {
  return String(type).replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getArtifactName(filePath) {
  return String(filePath).split(/[\\/]/).pop();
}

function getArtifactRelativePath(run, filePath) {
  const marker = `${run.run_folder}\\`;
  const unixMarker = `${run.run_folder}/`;
  if (String(filePath).includes(marker)) {
    return String(filePath).split(marker).pop();
  }
  if (String(filePath).includes(unixMarker)) {
    return String(filePath).split(unixMarker).pop();
  }
  return String(filePath);
}

function renderArtifacts(run) {
  artifactListEl.innerHTML = '';

  if (!run.artifacts?.length) {
    artifactPanelEl.classList.add('hidden');
    return;
  }

  artifactPanelEl.classList.remove('hidden');

  for (const artifact of run.artifacts) {
    const item = document.createElement('article');
    item.className = 'artifact-card';
    item.innerHTML = `
      <div class="artifact-top">
        <strong>${escapeHtml(getArtifactName(artifact.file_path))}</strong>
        <span class="artifact-type">${formatArtifactType(artifact.artifact_type)}</span>
      </div>
      <div class="muted artifact-path">${escapeHtml(getArtifactRelativePath(run, artifact.file_path))}</div>
      <div class="muted artifact-path">${escapeHtml(artifact.file_path)}</div>
    `;
    artifactListEl.appendChild(item);
  }
}

function renderRun(run) {
  activeRunId = run.id;
  runStateEl.className = 'hidden';
  runSummaryEl.classList.remove('hidden');
  runMetaEl.textContent = `Review Run #${run.id}`;
  runQuestionEl.textContent = run.question_text;
  runBadgeEl.textContent = formatStatus(run.status);
  runBadgeEl.className = `status-badge ${statusClass(run.status)}`;
  runProgressEl.textContent = `${describeWorkflowMode(run.workflow_mode)} | ${summarizeProgress(run)}`;
  runTimingEl.textContent = summarizeTiming(run);
  stepsEl.innerHTML = '';
  renderArtifacts(run);

  const failedStep = run.steps.find((step) => step.status === 'failed' && step.error_text);
  if (failedStep) {
    runErrorEl.textContent = `${failedStep.agent.display_name} failed: ${failedStep.error_text}`;
    runErrorEl.classList.remove('hidden');
  } else {
    runErrorEl.textContent = '';
    runErrorEl.classList.add('hidden');
  }

  const mosaic = run.steps.find((step) => step.agent.system_name === 'mosaic');
  finalOutputEl.textContent = mosaic?.output_text || 'Mosaic will publish the final synthesis here after the reviewer steps finish.';
  finalOutputEl.className = mosaic?.output_text ? '' : 'empty';

  for (const step of run.steps) {
    stepsEl.appendChild(renderStepCard(step));
  }

  if (pollTimer) clearInterval(pollTimer);
  if (run.status !== 'completed' && run.status !== 'failed') {
    pollTimer = setInterval(async () => {
      const latest = await request(`/api/runs/${activeRunId}`);
      renderRun(latest);
      await loadHistory();
    }, 1000);
  }
}

async function loadHistory() {
  const runs = await request('/api/runs');
  historyEl.innerHTML = '';

  if (!runs.length) {
    historyEl.innerHTML = '<div class="empty-state small">No saved runs yet. Your completed reviews will appear here.</div>';
    return;
  }

  for (const run of runs) {
    const button = document.createElement('button');
    button.className = `history-button ${activeRunId === run.id ? 'selected' : ''}`;
    button.innerHTML = `
      <div class="history-top">
        <strong>Run #${run.id}</strong>
        <span class="status-badge small ${statusClass(run.status)}">${formatStatus(run.status)}</span>
      </div>
      <div class="muted history-meta">${formatDateTime(run.created_at)} | ${describeWorkflowMode(run.workflow_mode)}</div>
      <div class="history-question">${escapeHtml(run.question_text.slice(0, 120))}</div>
    `;
    button.addEventListener('click', async () => {
      renderRun(await request(`/api/runs/${run.id}`));
      await loadHistory();
    });
    historyEl.appendChild(button);
  }
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  runButton.textContent = 'Starting...';
  setRunEmptyState('Starting a new run...');

  try {
    const payload = await request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionText: questionInput.value, workflowMode: modeInput.value }),
    });
    renderRun(await request(`/api/runs/${payload.runId}`));
    await loadHistory();
  } catch (error) {
    setRunEmptyState(`Unable to start run: ${error.message}`);
    console.error(error);
  } finally {
    runButton.disabled = false;
    runButton.textContent = 'Run Review';
  }
});

historyEl.innerHTML = '<div class="empty-state small">Loading run history...</div>';
loadHistory();
