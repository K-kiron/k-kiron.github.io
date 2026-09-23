// Loopback-only browser fixture: it never calls Workers AI or deploys anything.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
const root = new URL('../', import.meta.url);
const types = { 'index.html': 'text/html', 'app.js': 'text/javascript', 'assistant.js': 'text/javascript', 'profile-data.js': 'text/javascript', 'style.css': 'text/css', 'favicon.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const route = new URL(request.url, 'http://127.0.0.1:8773').pathname;
  if (route === '/chat' && request.method === 'POST') {
    let data = ''; for await (const chunk of request) data += chunk;
    const body = JSON.parse(data);
    if (body.question === 'slow') await setTimeout(6000);
    const status = body.question === 'quota' ? 429 : body.question === 'offline' ? 503 : 200;
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(status === 200 ? { answer: `Local test response · ${body.history.length} context messages.\n\nRule alignment asks whether a model follows the intended rule. The circuit is an illustration, not a research result.\n\n${body.question === 'xss' ? '<img src=x onerror=alert(1)>' : ''}`, source_ids: ['profile', 'circuit'], action: 'ablate_rule' } : { error: status === 429 ? 'daily_limit' : 'temporarily_unavailable' }));
    return;
  }
  const file = route === '/' ? 'index.html' : route.slice(1);
  if (!Object.hasOwn(types, file)) { response.writeHead(404).end(); return; }
  let content = await readFile(new URL(file, root), 'utf8');
  if (file === 'index.html') content = content.replace('name="assistant-endpoint" content=""', 'name="assistant-endpoint" content="http://127.0.0.1:8773/chat"');
  response.writeHead(200, { 'Content-Type': types[file] + '; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(content);
});
server.listen(8773, '127.0.0.1', () => console.log('Local fixture: http://127.0.0.1:8773/ (no model calls)'));
