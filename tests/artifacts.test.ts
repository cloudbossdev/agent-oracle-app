// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRunFolder } from '../src/artifacts.js';
import { createTempWorkspace } from './helpers.js';

test('run folder creation increments folder names', () => {
  const root = createTempWorkspace('artifact-test-');
  const first = createRunFolder(path.join(root, 'runs'));
  const second = createRunFolder(path.join(root, 'runs'));
  assert.notEqual(first.folderName, second.folderName);
  assert.equal(fs.existsSync(first.folderPath), true);
  assert.equal(fs.existsSync(second.folderPath), true);
});
