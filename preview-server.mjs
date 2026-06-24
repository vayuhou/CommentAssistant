import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { loadEnvFile } from 'node:process';

try { loadEnvFile(join(import.meta.dirname, '.env')); } catch {}

const root = join(import.meta.dirname, 'dist');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};
const rateBuckets = new Map();

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('请求内容过大');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function allowRequest(ip) {
  const minute = Math.floor(Date.now() / 60000);
  const key = `${ip}:${minute}`;
  const used = rateBuckets.get(key) || 0;
  rateBuckets.set(key, used + 1);
  if (rateBuckets.size > 2000) rateBuckets.clear();
  return used < 20;
}

async function handleAi(req, res, mode) {
  if (!allowRequest(req.socket.remoteAddress || 'local')) {
    return json(res, 429, { success:false, error:'请求过于频繁，请稍后再试' });
  }
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_API_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/$/, '');
  if (!apiKey) return json(res, 503, { success:false, code:'AI_NOT_CONFIGURED', error:'服务端尚未配置 AI_API_KEY' });

  try {
    const body = await readJson(req);
    const student = body.student || {};
    const showStudentName = body.showStudentName !== false;
    const target = Math.min(500, Math.max(80, Number(body.targetLength) || 150));
    const system = mode === 'polish'
      ? '你是一名有经验的中小学班主任。请润色评语，语言自然真诚、温和，不要出现 AI、标签或系统等字样，只输出评语正文。'
      : '你是一名中小学班主任。请根据学生信息重写一段期末评语，先肯定优点，再委婉提出建议，最后表达期待，只输出正文。';
    const user = JSON.stringify({ 姓名:showStudentName?student.name:'正文中不要出现学生姓名', 是否显示姓名:showStudentName, 性别:student.gender, 类型:student.type, 表现标签:Object.values(student.tags || {}).flat(), 补充说明:student.note, 原评语:body.baseComment, 语气:body.tone || '温和鼓励', 目标字数:target, 格式要求:showStudentName?'正文开头自然带上学生姓名':'正文中不得出现学生姓名，也不要用“某某同学”等占位符' });
    const models = [...new Set([process.env.AI_MODEL || 'deepseek-chat', process.env.AI_FALLBACK_MODEL].filter(Boolean))];
    let lastError = '';

    for (const model of models) {
      const upstream = await fetch(`${baseUrl}/chat/completions`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
        body:JSON.stringify({ model, messages:[{role:'system',content:system},{role:'user',content:user}], temperature:Number(process.env.AI_TEMPERATURE || .7), max_tokens:Number(process.env.AI_MAX_OUTPUT_TOKENS || 600) }),
      });
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        lastError = result?.error?.message || `AI 接口错误 ${upstream.status}`;
        continue;
      }
      let comment = result?.choices?.[0]?.message?.content?.trim();
      if (comment && !showStudentName && student.name) comment = comment.replaceAll(`${student.name}同学，`, '').replaceAll(`${student.name}同学`, '').replaceAll(student.name, '').trim();
      if (comment) return json(res, 200, { success:true, data:{ comment:comment.slice(0,500), model } });
      lastError = '模型返回内容为空';
    }
    throw new Error(lastError || 'AI 请求失败');
  } catch (error) {
    return json(res, 502, { success:false, error:error instanceof Error ? error.message : 'AI 请求失败' });
  }
}

http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/comment/ai-polish') return await handleAi(req, res, 'polish');
    if (req.method === 'POST' && req.url === '/api/comment/ai-rewrite') return await handleAi(req, res, 'rewrite');
    if (req.url === '/api/health') return json(res, 200, { ok:true, aiConfigured:Boolean(process.env.AI_API_KEY), model:process.env.AI_MODEL || 'deepseek-chat', fallbackModel:process.env.AI_FALLBACK_MODEL || null });
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    let file = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
    if (!file.startsWith(root)) throw new Error('invalid path');
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); }
    catch { file = join(root, 'index.html'); }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Server ready on port ${port}`));
