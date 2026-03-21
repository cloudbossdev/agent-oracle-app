const questionInput = document.getElementById('question');
const modeInput = document.getElementById('mode');
const runButton = document.getElementById('runButton');
const historyEl = document.getElementById('history');
const runMetaEl = document.getElementById('runMeta');
const stepsEl = document.getElementById('steps');
const finalOutputEl = document.getElementById('finalOutput');

let activeRunId = null;
let pollTimer = null;

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function renderRun(run) {
  activeRunId = run.id;
  runMetaEl.textContent = `Run #${run.id} · ${run.workflow_mode} · ${run.status} · ${run.question_text}`;
  stepsEl.innerHTML = '';
  const mosaic = run.steps.find((step) => step.agent.system_name === 'mosaic');
  finalOutputEl.textContent = mosaic?.output_text || 'Mosaic output will appear here after prior steps complete.';
  finalOutputEl.className = mosaic?.output_text ? '' : 'empty';

  for (const step of run.steps) {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
      <div class="step-header">
        <strong>${step.agent.display_name} · ${step.agent.role_name}</strong>
        <span>${step.status}</span>
      </div>
      <div class="muted">Started: ${step.started_at || '—'} · Completed: ${step.completed_at || '—'}</div>
      ${step.output_text ? `<pre>${escapeHtml(step.output_text)}</pre>` : ''}
      ${step.error_text ? `<pre>${escapeHtml(step.error_text)}</pre>` : ''}
    `;
    stepsEl.appendChild(card);
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

function escapeHtml(input) {
  return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function loadHistory() {
  const runs = await request('/api/runs');
  historyEl.innerHTML = '';
  for (const run of runs) {
    const button = document.createElement('button');
    button.className = 'history-button';
    button.innerHTML = `<strong>Run #${run.id}</strong> · ${run.workflow_mode} · ${run.status}<br><span class="muted">${new Date(run.created_at).toLocaleString()} · ${escapeHtml(run.question_text.slice(0, 100))}</span>`;
    button.addEventListener('click', async () => renderRun(await request(`/api/runs/${run.id}`)));
    historyEl.appendChild(button);
  }
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  try {
    const payload = await request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionText: questionInput.value, workflowMode: modeInput.value }),
    });
    renderRun(await request(`/api/runs/${payload.runId}`));
    await loadHistory();
  } finally {
    runButton.disabled = false;
  }
});

loadHistory();
