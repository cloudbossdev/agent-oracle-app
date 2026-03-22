// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createTempWorkspace } from './helpers.js';

test('SQLite persistence creates run and step rows', async () => {
  const root = createTempWorkspace('db-test-');
  process.env.APP_DB_PATH = path.join(root, 'app.db');
  process.chdir(root);
  const db = await import('../src/db.js');
  db.initDb();
  const run = db.createRun('Question', 'independent', '2026-03-21_001');
  const agents = db.listAgents();
  db.createRunSteps(run.id, agents);
  const detail = db.getRunWithSteps(run.id);
  assert.equal(detail?.question_text, 'Question');
  assert.equal(detail?.steps.length, 4);
});

test('run history summaries include progress and final synthesis preview', async () => {
  const root = createTempWorkspace('db-history-test-');
  process.env.APP_DB_PATH = path.join(root, 'app.db');
  process.chdir(root);
  const db = await import('../src/db.js');
  db.initDb();
  const run = db.createRun('Question', 'independent', '2026-03-21_001');
  const agents = db.listAgents();
  db.createRunSteps(run.id, agents);
  const detail = db.getRunWithSteps(run.id);
  const atlas = detail.steps[0];
  const sage = detail.steps[1];
  const mosaic = detail.steps[3];
  db.updateStep(atlas.id, { status: 'completed', completed_at: '2026-03-21T00:00:00.000Z' });
  db.updateStep(sage.id, { status: 'failed', error_text: 'Shell exploded', completed_at: '2026-03-21T00:00:01.000Z' });
  db.updateStep(mosaic.id, {
    status: 'completed',
    output_text: '# Agent Output\n\n## Summary\nClear final synthesis\n\n## Response\nBody\n',
    completed_at: '2026-03-21T00:00:02.000Z',
  });
  db.recordArtifact(run.id, null, 'question', 'C:\\runs\\question.md');
  const summary = db.listRunSummaries()[0];
  assert.equal(summary.total_steps, 4);
  assert.equal(summary.completed_steps, 2);
  assert.equal(summary.failed_steps, 1);
  assert.equal(summary.artifact_count, 1);
  assert.equal(summary.failed_agent_name, 'Sage');
  assert.match(summary.failed_error_text, /Shell exploded/);
  assert.equal(summary.final_summary, 'Clear final synthesis');
});
