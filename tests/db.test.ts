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
