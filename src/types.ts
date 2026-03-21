// @ts-nocheck
export type WorkflowMode = 'independent' | 'relay';
export type Status = 'queued' | 'preparing' | 'running' | 'completed' | 'failed' | 'waiting_for_dependency';

export interface AgentRecord {
  id: number;
  system_name: string;
  display_name: string;
  role_name: string;
  instruction_file: string;
  sort_order: number;
  is_synthesizer: number;
  enabled: number;
}

export interface RunRecord {
  id: number;
  created_at: string;
  updated_at: string;
  question_text: string;
  workflow_mode: WorkflowMode;
  status: Status;
  run_folder: string;
}

export interface RunStepRecord {
  id: number;
  run_id: number;
  agent_id: number;
  step_order: number;
  status: Status;
  input_text: string | null;
  output_text: string | null;
  input_file_path: string | null;
  output_file_path: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_text: string | null;
}

export interface ArtifactRecord {
  id: number;
  run_id: number;
  agent_id: number | null;
  artifact_type: string;
  file_path: string;
  created_at: string;
}

export interface RunDetail extends RunRecord {
  steps: Array<RunStepRecord & { agent: AgentRecord }>;
}

export interface AgentExecutionInput {
  runId: number;
  workflowMode: WorkflowMode;
  questionText: string;
  agent: AgentRecord;
  instructionText: string;
  priorContext: string;
  task: string;
  stepOrder: number;
}

export interface AgentExecutionResult {
  summary: string;
  response: string;
  risks: string;
  nextStep: string;
}

export interface AgentProvider {
  execute(input: AgentExecutionInput): Promise<AgentExecutionResult>;
}
