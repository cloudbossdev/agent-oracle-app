// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTempWorkspace, waitForCompletion } from './helpers.js';

test('integration: independent mode runs all four steps and writes markdown artifacts', async () => {
  const root = createTempWorkspace('conductor-independent-');
  const repoRoot = process.cwd();
  process.env.APP_DB_PATH = path.join(root, 'app.db');
  process.chdir(root);
  fs.mkdirSync(path.join(root, 'agents'), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, 'agents', 'atlas.md'), path.join(root, 'agents', 'atlas.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'sage.md'), path.join(root, 'agents', 'sage.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'nova.md'), path.join(root, 'agents', 'nova.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'mosaic.md'), path.join(root, 'agents', 'mosaic.md'));
  const db = await import('../src/db.js');
  const conductor = await import('../src/conductor.js');
  db.initDb();
  const runId = await conductor.startRun('Test independent workflow', 'independent');
  const run = await waitForCompletion(db.getRunWithSteps, runId);
  const atlasInput = fs.readFileSync(path.join(root, 'runs', run.run_folder, 'atlas-input.md'), 'utf8');
  assert.equal(run.steps.length, 4);
  assert.equal(run.steps.every((step: any) => step.status === 'completed'), true);
  assert.equal(fs.existsSync(path.join(root, 'runs', run.run_folder, 'question.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'runs', run.run_folder, 'atlas-input.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'runs', run.run_folder, 'mosaic-output.md')), true);
  assert.match(atlasInput, /## Agent Instructions/);
  assert.match(atlasInput, /Identity: Atlas/);
});

test('integration: relay mode stores final synthesis and dependency-aware inputs', async () => {
  const root = createTempWorkspace('conductor-relay-');
  const repoRoot = process.cwd();
  process.env.APP_DB_PATH = path.join(root, 'app.db');
  process.chdir(root);
  fs.mkdirSync(path.join(root, 'agents'), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, 'agents', 'atlas.md'), path.join(root, 'agents', 'atlas.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'sage.md'), path.join(root, 'agents', 'sage.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'nova.md'), path.join(root, 'agents', 'nova.md'));
  fs.copyFileSync(path.join(repoRoot, 'agents', 'mosaic.md'), path.join(root, 'agents', 'mosaic.md'));
  const db = await import('../src/db.js');
  const conductor = await import('../src/conductor.js');
  db.initDb();
  const runId = await conductor.startRun('Test relay workflow', 'relay');
  const run = await waitForCompletion(db.getRunWithSteps, runId);
  const sageInput = fs.readFileSync(path.join(root, 'runs', run.run_folder, 'sage-input.md'), 'utf8');
  const finalStep = run.steps.find((step: any) => step.agent.system_name === 'mosaic');
  assert.match(sageInput, /Primary prior context from Atlas/);
  assert.match(sageInput, /## Agent Instructions/);
  assert.match(sageInput, /Identity: Sage/);
  assert.match(finalStep.output_text, /Mosaic/);
  assert.match(finalStep.output_text, /## Response/);
});
