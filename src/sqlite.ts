// @ts-nocheck
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function getDbPath() {
  return process.env.APP_DB_PATH ?? path.join(process.cwd(), 'app.db');
}

function ensureDbDir() {
  fs.mkdirSync(path.dirname(getDbPath()), { recursive: true });
}

function escapeValue(value: string | number | null) {
  if (value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

export function sqliteExec(sql: string) {
  ensureDbDir();
  execFileSync('sqlite3', [getDbPath(), sql], { stdio: 'pipe' });
}

export function sqliteQuery<T>(sql: string): T[] {
  ensureDbDir();
  const output = execFileSync('sqlite3', ['-json', getDbPath(), sql], { encoding: 'utf8' });
  const trimmed = output.trim();
  return trimmed ? (JSON.parse(trimmed) as T[]) : [];
}

export function sqlInsert(table: string, values: Record<string, string | number | null>) {
  const columns = Object.keys(values).join(', ');
  const entries = Object.values(values).map(escapeValue).join(', ');
  return `INSERT INTO ${table} (${columns}) VALUES (${entries});`;
}

export function sqlUpdate(table: string, values: Record<string, string | number | null>, where: string) {
  const pairs = Object.entries(values).map(([key, value]) => `${key} = ${escapeValue(value)}`).join(', ');
  return `UPDATE ${table} SET ${pairs} WHERE ${where};`;
}
