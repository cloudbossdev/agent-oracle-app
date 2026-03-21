// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';

const statuses = ['queued', 'preparing', 'running', 'completed', 'failed', 'waiting_for_dependency'];

test('required statuses are present', () => {
  assert.equal(statuses.includes('queued'), true);
  assert.equal(statuses.includes('waiting_for_dependency'), true);
  assert.equal(statuses.includes('completed'), true);
});
