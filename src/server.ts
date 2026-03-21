// @ts-nocheck
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { startRun } from './conductor.js';
import { getRunWithSteps, initDb, listRuns } from './db.js';
import { renderIndexHtml } from './html.js';

initDb();
const publicDir = path.join(process.cwd(), 'public');

function sendJson(response: http.ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function sendText(response: http.ServerResponse, statusCode: number, contentType: string, body: string) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(body);
}

async function readBody(request: http.IncomingMessage) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/') {
    sendText(response, 200, 'text/html; charset=utf-8', renderIndexHtml());
    return;
  }

  if (request.method === 'GET' && (url.pathname === '/styles.css' || url.pathname === '/app.js')) {
    const filePath = path.join(publicDir, url.pathname.slice(1));
    const contentType = url.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8';
    sendText(response, 200, contentType, fs.readFileSync(filePath, 'utf8'));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/runs') {
    sendJson(response, 200, listRuns());
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/runs') {
    const body = JSON.parse(await readBody(request));
    const questionText = String(body.questionText ?? '').trim();
    const workflowMode = String(body.workflowMode ?? '');
    if (!questionText) {
      sendJson(response, 400, { error: 'questionText is required' });
      return;
    }
    if (workflowMode !== 'independent' && workflowMode !== 'relay') {
      sendJson(response, 400, { error: 'workflowMode must be independent or relay' });
      return;
    }
    const runId = await startRun(questionText, workflowMode);
    sendJson(response, 201, { runId });
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/runs/')) {
    const runId = Number(url.pathname.split('/').pop());
    const run = getRunWithSteps(runId);
    if (!run) {
      sendJson(response, 404, { error: 'Run not found' });
      return;
    }
    sendJson(response, 200, run);
    return;
  }

  sendText(response, 404, 'text/plain; charset=utf-8', 'Not found');
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`Local Multi-Agent Review Workbench listening on http://localhost:${port}`);
});
