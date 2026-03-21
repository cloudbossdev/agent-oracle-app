// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPriorContext } from '../src/workflow.js';
import type { AgentRecord } from '../src/types.js';

const atlas = { id: 1, system_name: 'atlas', display_name: 'Atlas', role_name: 'Systems Architect', instruction_file: 'agents/atlas.md', sort_order: 1, is_synthesizer: 0, enabled: 1 } satisfies AgentRecord;
const sage = { ...atlas, id: 2, system_name: 'sage', display_name: 'Sage', role_name: 'Critical Analyst', sort_order: 2 } satisfies AgentRecord;
const mosaic = { ...atlas, id: 4, system_name: 'mosaic', display_name: 'Mosaic', role_name: 'Synthesizer', sort_order: 4, is_synthesizer: 1 } satisfies AgentRecord;

test('workflow mode input construction behaves correctly', () => {
  assert.equal(buildPriorContext('independent', sage, [{ agentName: 'Atlas', output: 'A' }]), 'None');
  assert.match(buildPriorContext('relay', sage, [{ agentName: 'Atlas', output: 'A' }]), /Primary prior context from Atlas/);
  const synthesisContext = buildPriorContext('relay', mosaic, [{ agentName: 'Atlas', output: 'A' }, { agentName: 'Sage', output: 'B' }]);
  assert.match(synthesisContext, /### Atlas/);
  assert.match(synthesisContext, /### Sage/);
});
