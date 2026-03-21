// @ts-nocheck
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function createTempWorkspace(prefix: string) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, 'runs'), { recursive: true });
  return root;
}

export async function waitForCompletion(getRunWithSteps: (runId: number) => any, runId: number) {
  for (let index = 0; index < 60; index += 1) {
    const run = getRunWithSteps(runId);
    if (run?.status === 'completed') return run;
    if (run?.status === 'failed') throw new Error(`Run failed: ${run.steps.find((step: any) => step.error_text)?.error_text ?? 'unknown error'}`);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Timed out waiting for run completion.');
}

export async function waitForTerminalRun(getRunWithSteps: (runId: number) => any, runId: number) {
  for (let index = 0; index < 60; index += 1) {
    const run = getRunWithSteps(runId);
    if (run?.status === 'completed' || run?.status === 'failed') return run;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Timed out waiting for terminal run status.');
}
