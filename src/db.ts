// @ts-nocheck
import { AGENT_SEED } from './agents.js';
import { sqlInsert, sqlUpdate, sqliteExec, sqliteQuery } from './sqlite.js';
import type { AgentRecord, ArtifactRecord, RunDetail, RunRecord, RunStepRecord, Status, WorkflowMode } from './types.js';

function now() {
  return new Date().toISOString();
}

export function initDb() {
  sqliteExec(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      question_text TEXT NOT NULL,
      workflow_mode TEXT NOT NULL,
      status TEXT NOT NULL,
      run_folder TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role_name TEXT NOT NULL,
      instruction_file TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_synthesizer INTEGER NOT NULL,
      enabled INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS run_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      step_order INTEGER NOT NULL,
      status TEXT NOT NULL,
      input_text TEXT,
      output_text TEXT,
      input_file_path TEXT,
      output_file_path TEXT,
      started_at TEXT,
      completed_at TEXT,
      error_text TEXT
    );
    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      agent_id INTEGER,
      artifact_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  for (const seed of AGENT_SEED) {
    sqliteExec(`
      INSERT INTO agents (system_name, display_name, role_name, instruction_file, sort_order, is_synthesizer, enabled)
      VALUES ('${seed[0]}', '${seed[1]}', '${seed[2]}', '${seed[3]}', ${seed[4]}, ${seed[5]}, ${seed[6]})
      ON CONFLICT(system_name) DO UPDATE SET
        display_name=excluded.display_name,
        role_name=excluded.role_name,
        instruction_file=excluded.instruction_file,
        sort_order=excluded.sort_order,
        is_synthesizer=excluded.is_synthesizer,
        enabled=excluded.enabled;
    `);
  }
}

export function listAgents(): AgentRecord[] {
  return sqliteQuery<AgentRecord>('SELECT * FROM agents WHERE enabled = 1 ORDER BY sort_order ASC;');
}

export function createRun(questionText: string, workflowMode: WorkflowMode, runFolder: string): RunRecord {
  const timestamp = now();
  sqliteExec(sqlInsert('runs', {
    created_at: timestamp,
    updated_at: timestamp,
    question_text: questionText,
    workflow_mode: workflowMode,
    status: 'queued',
    run_folder: runFolder,
  }));
  return sqliteQuery<RunRecord>('SELECT * FROM runs ORDER BY id DESC LIMIT 1;')[0];
}

export function createRunSteps(runId: number, agents: AgentRecord[]) {
  for (const agent of agents) {
    sqliteExec(sqlInsert('run_steps', {
      run_id: runId,
      agent_id: agent.id,
      step_order: agent.sort_order,
      status: agent.sort_order === 1 ? 'queued' : 'waiting_for_dependency',
      input_text: null,
      output_text: null,
      input_file_path: null,
      output_file_path: null,
      started_at: null,
      completed_at: null,
      error_text: null,
    }));
  }
}

export function recordArtifact(runId: number, agentId: number | null, artifactType: string, filePath: string) {
  sqliteExec(sqlInsert('artifacts', {
    run_id: runId,
    agent_id: agentId,
    artifact_type: artifactType,
    file_path: filePath,
    created_at: now(),
  }));
}

export function listArtifactsForRun(runId: number): ArtifactRecord[] {
  return sqliteQuery<ArtifactRecord>(`
    SELECT id, run_id, agent_id, artifact_type, file_path, created_at
    FROM artifacts
    WHERE run_id = ${runId}
    ORDER BY created_at ASC, id ASC;
  `);
}

export function updateRunStatus(runId: number, status: Status) {
  sqliteExec(sqlUpdate('runs', { status, updated_at: now() }, `id = ${runId}`));
}

export function updateStep(stepId: number, patch: Partial<RunStepRecord>) {
  const step = sqliteQuery<RunStepRecord>(`SELECT * FROM run_steps WHERE id = ${stepId};`)[0];
  const merged = { ...step, ...patch };
  sqliteExec(sqlUpdate('run_steps', {
    status: merged.status,
    input_text: merged.input_text,
    output_text: merged.output_text,
    input_file_path: merged.input_file_path,
    output_file_path: merged.output_file_path,
    started_at: merged.started_at,
    completed_at: merged.completed_at,
    error_text: merged.error_text,
  }, `id = ${stepId}`));
}

export function listRuns(limit = 20): RunRecord[] {
  return sqliteQuery<RunRecord>(`SELECT * FROM runs ORDER BY created_at DESC LIMIT ${limit};`);
}

export function getRun(runId: number): RunRecord | undefined {
  return sqliteQuery<RunRecord>(`SELECT * FROM runs WHERE id = ${runId};`)[0];
}

export function getRunWithSteps(runId: number): RunDetail | undefined {
  const run = getRun(runId);
  if (!run) return undefined;
  const rows = sqliteQuery<Array<RunStepRecord & AgentRecord & { join_agent_id: number }>[number]>(`
    SELECT rs.id, rs.run_id, rs.agent_id, rs.step_order, rs.status, rs.input_text, rs.output_text, rs.input_file_path, rs.output_file_path, rs.started_at, rs.completed_at, rs.error_text,
           a.id as join_agent_id, a.system_name, a.display_name, a.role_name, a.instruction_file, a.sort_order, a.is_synthesizer, a.enabled
    FROM run_steps rs
    JOIN agents a ON a.id = rs.agent_id
    WHERE rs.run_id = ${runId}
    ORDER BY rs.step_order ASC;
  `);
  const artifacts = listArtifactsForRun(runId);
  return {
    ...run,
    steps: rows.map((row) => ({
      id: row.id,
      run_id: row.run_id,
      agent_id: row.agent_id,
      step_order: row.step_order,
      status: row.status,
      input_text: row.input_text,
      output_text: row.output_text,
      input_file_path: row.input_file_path,
      output_file_path: row.output_file_path,
      started_at: row.started_at,
      completed_at: row.completed_at,
      error_text: row.error_text,
      agent: {
        id: row.join_agent_id,
        system_name: row.system_name,
        display_name: row.display_name,
        role_name: row.role_name,
        instruction_file: row.instruction_file,
        sort_order: row.sort_order,
        is_synthesizer: row.is_synthesizer,
        enabled: row.enabled,
      },
    })),
    artifacts,
  };
}
