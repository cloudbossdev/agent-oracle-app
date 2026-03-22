import fs from 'node:fs';
import path from 'node:path';

const tempDir = path.join(process.cwd(), '.tmp');
fs.mkdirSync(tempDir, { recursive: true });

process.env.PORT = process.env.PORT || '3020';
process.env.APP_DB_PATH = process.env.APP_DB_PATH || path.join(tempDir, 'smoke.db');

await import('../dist/src/server.js');
