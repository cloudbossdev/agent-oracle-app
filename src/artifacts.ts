// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import type { AgentRecord, AgentExecutionResult, WorkflowMode } from './types.js';

export function createRunFolder(baseDir = path.join(process.cwd(), 'runs')) {
  fs.mkdirSync(baseDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  let index = 1;
  while (true) {
    const folderName = `${date}_${String(index).padStart(3, '0')}`;
    const folderPath = path.join(baseDir, folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      return { folderName, folderPath };
    }
    index += 1;
  }
}

export function writeQuestionArtifact(runFolder: string, runId: number, questionText: string) {
  const filePath = path.join(runFolder, 'question.md');
  fs.writeFileSync(filePath, `# Question\n\n## Run ID\n${runId}\n\n## User Question\n${questionText}\n`);
  return filePath;
}

export function writeManifest(runFolder: string, payload: object) {
  const filePath = path.join(runFolder, 'manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

export function buildAgentInputMarkdown(params: {
  runId: number;
  agent: AgentRecord;
  workflowMode: WorkflowMode;
  questionText: string;
  priorContext: string;
  task: string;
}) {
  const { runId, agent, workflowMode, questionText, priorContext, task } = params;
  return `# Agent Input\n\n## Run ID\n${runId}\n\n## Agent Name\n${agent.display_name}\n\n## Role\n${agent.role_name}\n\n## Workflow Mode\n${workflowMode}\n\n## Original Question\n${questionText}\n\n## Prior Context\n${priorContext}\n\n## Task\n${task}\n`;
}

export function writeAgentInput(runFolder: string, agent: AgentRecord, content: string) {
  const filePath = path.join(runFolder, `${agent.system_name}-input.md`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

export function buildAgentOutputMarkdown(params: { runId: number; agent: AgentRecord; status: string; result: AgentExecutionResult }) {
  const { runId, agent, status, result } = params;
  return `# Agent Output\n\n## Agent\n${agent.display_name}\n\n## Run ID\n${runId}\n\n## Status\n${status}\n\n## Summary\n${result.summary}\n\n## Response\n${result.response}\n\n## Risks / Caveats\n${result.risks}\n\n## Recommended Next Step\n${result.nextStep}\n`;
}

export function writeAgentOutput(runFolder: string, agent: AgentRecord, content: string) {
  const filePath = path.join(runFolder, `${agent.system_name}-output.md`);
  fs.writeFileSync(filePath, content);
  return filePath;
}
