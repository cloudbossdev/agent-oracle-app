// @ts-nocheck
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function getDbPath() {
  return process.env.APP_DB_PATH ?? path.join(process.cwd(), 'app.db');
}

let cachedSqliteBinary: string | null = null;

function ensureDbDir() {
  fs.mkdirSync(path.dirname(getDbPath()), { recursive: true });
}

function resolveSqliteBinary() {
  if (cachedSqliteBinary) return cachedSqliteBinary;

  const candidates: string[] = [];
  if (process.env.SQLITE3_PATH) candidates.push(process.env.SQLITE3_PATH);

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const wingetPackagesDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetPackagesDir)) {
        for (const entry of fs.readdirSync(wingetPackagesDir, { withFileTypes: true })) {
          if (!entry.isDirectory() || !entry.name.startsWith('SQLite.SQLite_')) continue;
          candidates.push(path.join(wingetPackagesDir, entry.name, 'sqlite3.exe'));
        }
      }

      candidates.push(path.join(localAppData, 'Microsoft', 'WindowsApps', 'sqlite3.exe'));
    }
  }

  candidates.push('sqlite3');

  for (const candidate of candidates) {
    if (path.isAbsolute(candidate)) {
      if (fs.existsSync(candidate)) {
        cachedSqliteBinary = candidate;
        return cachedSqliteBinary;
      }
      continue;
    }

    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      cachedSqliteBinary = candidate;
      return cachedSqliteBinary;
    } catch {}
  }

  throw new Error('sqlite3 CLI not found. Install SQLite or set SQLITE3_PATH.');
}

function escapeValue(value: string | number | null) {
  if (value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

export function sqliteExec(sql: string) {
  ensureDbDir();
  execFileSync(resolveSqliteBinary(), [getDbPath(), sql], { stdio: 'pipe' });
}

export function sqliteQuery<T>(sql: string): T[] {
  ensureDbDir();
  const output = execFileSync(resolveSqliteBinary(), ['-json', getDbPath(), sql], { encoding: 'utf8' });
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
