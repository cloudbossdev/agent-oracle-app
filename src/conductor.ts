// @ts-nocheck
import { buildAgentInputMarkdown, buildAgentOutputMarkdown, createRunFolder, writeAgentInput, writeAgentOutput, writeManifest, writeQuestionArtifact } from './artifacts.js';
import { createRun, createRunSteps, getRunWithSteps, listAgents, recordArtifact, updateRunStatus, updateStep } from './db.js';
import { MockAgentProvider } from './provider.js';
import { buildPriorContext, buildTask, loadAgentInstruction } from './workflow.js';
import type { AgentProvider, WorkflowMode } from './types.js';

let provider: AgentProvider = new MockAgentProvider();

export function setAgentProvider(nextProvider: AgentProvider) {
  provider = nextProvider;
}

export async function startRun(questionText: string, workflowMode: WorkflowMode) {
  const agents = listAgents();
  const { folderName, folderPath } = createRunFolder();
  const run = createRun(questionText, workflowMode, folderName);
  createRunSteps(run.id, agents);
  recordArtifact(run.id, null, 'question', writeQuestionArtifact(folderPath, run.id, questionText));
  recordArtifact(run.id, null, 'manifest', writeManifest(folderPath, { runId: run.id, workflowMode, folderName, createdAt: run.created_at }));
  void processRun(run.id, questionText, workflowMode, folderPath);
  return run.id;
}

async function processRun(runId: number, questionText: string, workflowMode: WorkflowMode, folderPath: string) {
  updateRunStatus(runId, 'preparing');
  const previousOutputs: Array<{ agentName: string; output: string }> = [];
  try {
    const run = getRunWithSteps(runId);
    if (!run) throw new Error('Run not found after creation.');

    for (const step of run.steps) {
      updateRunStatus(runId, 'running');
      updateStep(step.id, { status: 'preparing' });
      const instructionText = loadAgentInstruction(step.agent);
      const priorContext = buildPriorContext(workflowMode, step.agent, previousOutputs);
      const task = buildTask(step.agent, workflowMode);
      const inputText = buildAgentInputMarkdown({ runId, agent: step.agent, workflowMode, questionText, instructionText, priorContext, task });
      const inputPath = writeAgentInput(folderPath, step.agent, inputText);
      recordArtifact(runId, step.agent.id, 'agent_input', inputPath);
      updateStep(step.id, { status: 'running', input_text: inputText, input_file_path: inputPath, started_at: new Date().toISOString() });

      const result = await provider.execute({ runId, workflowMode, questionText, agent: step.agent, instructionText, priorContext, task, stepOrder: step.step_order });
      const outputText = buildAgentOutputMarkdown({ runId, agent: step.agent, status: 'completed', result });
      const outputPath = writeAgentOutput(folderPath, step.agent, outputText);
      recordArtifact(runId, step.agent.id, 'agent_output', outputPath);
      updateStep(step.id, { status: 'completed', output_text: outputText, output_file_path: outputPath, completed_at: new Date().toISOString() });
      previousOutputs.push({ agentName: step.agent.display_name, output: outputText });

      const latest = getRunWithSteps(runId);
      const next = latest?.steps.find((item) => item.step_order === step.step_order + 1 && item.status === 'waiting_for_dependency');
      if (next) {
        updateStep(next.id, { status: 'queued' });
      }
    }

    updateRunStatus(runId, 'completed');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const latest = getRunWithSteps(runId);
    const current = latest?.steps.find((step) => step.status === 'running' || step.status === 'preparing');
    if (current) {
      updateStep(current.id, { status: 'failed', error_text: message, completed_at: new Date().toISOString() });
    }
    updateRunStatus(runId, 'failed');
  }
}
