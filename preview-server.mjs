import http from 'node:http';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { loadEnvFile } from 'node:process';
import { randomBytes, timingSafeEqual } from 'node:crypto';

try { loadEnvFile(join(import.meta.dirname, '.env')); } catch {}

const root = join(import.meta.dirname, 'dist');
const dataDir = join(import.meta.dirname, 'data');
const dbFile = join(dataDir, 'activation-db.json');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2',
};
const rateBuckets = new Map();
const adminSessions = new Map();
const pendingAi = new Map();
let database = { codes:[] };
let writeQueue = Promise.resolve();

async function loadDatabase() {
  await mkdir(dataDir, { recursive:true });
  try {
    const parsed = JSON.parse(await readFile(dbFile, 'utf8'));
    if (Array.isArray(parsed.codes)) database = parsed;
  } catch (error) {
    if (error?.code !== 'ENOENT') console.error('Activation database load failed:', error);
  }
}

function saveDatabase() {
  writeQueue = writeQueue.then(async () => {
    const temporary = `${dbFile}.tmp`;
    await writeFile(temporary, JSON.stringify(database, null, 2), { encoding:'utf8', mode:0o600 });
    await rename(temporary, dbFile);
  });
  return writeQueue;
}

function json(res, status, value, headers={}) {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  const chunks=[]; let size=0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64*1024) throw new Error('请求内容过大');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function allowRequest(ip) {
  const minute=Math.floor(Date.now()/60000); const key=`${ip}:${minute}`; const used=rateBuckets.get(key)||0;
  rateBuckets.set(key, used+1); if(rateBuckets.size>2000)rateBuckets.clear(); return used<20;
}

function safeEqual(left, right) {
  const a=Buffer.from(String(left)); const b=Buffer.from(String(right));
  return a.length===b.length && timingSafeEqual(a,b);
}

function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const i=v.indexOf('=');return [decodeURIComponent(v.slice(0,i)),decodeURIComponent(v.slice(i+1))]}));
}

function isSecureRequest(req) { return req.headers['x-forwarded-proto']==='https' || process.env.NODE_ENV==='production'; }
function sessionCookie(req, token, maxAge=28800) { return `comment_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isSecureRequest(req)?'; Secure':''}`; }

function requireAdmin(req, res) {
  const token=cookies(req).comment_admin; const expiresAt=token&&adminSessions.get(token);
  if (!expiresAt || expiresAt<Date.now()) { if(token)adminSessions.delete(token); json(res,401,{success:false,error:'管理员登录已失效'}); return false; }
  return true;
}

function newCode() {
  const part=()=>randomBytes(3).toString('hex').slice(0,4).toUpperCase();
  let code; do { code=`PY-${part()}-${part()}-${part()}`; } while(database.codes.some(item=>item.code===code)); return code;
}

function publicCode(item) {
  const expired=Boolean(item.expiresAt && Date.parse(item.expiresAt)<=Date.now());
  return { code:item.code, days:item.days, totalAiQuota:item.totalAiQuota, usedAiCount:item.usedAiCount, remainingAiCount:Math.max(0,item.totalAiQuota-item.usedAiCount), deviceId:item.deviceId, createdAt:item.createdAt, activatedAt:item.activatedAt, expiresAt:item.expiresAt, revoked:Boolean(item.revoked), status:item.revoked?'revoked':expired?'expired':item.deviceId?'active':'unused' };
}

function activationState(item, deviceId) {
  const view=publicCode(item); const deviceMatches=Boolean(item.deviceId && item.deviceId===deviceId);
  return { code:item.code, active:deviceMatches&&view.status==='active'&&view.remainingAiCount>0, expired:view.status==='expired', expiresAt:item.expiresAt||'', totalAiQuota:item.totalAiQuota, usedAiCount:item.usedAiCount, remainingAiCount:view.remainingAiCount, deviceId };
}

async function activateLicense(body) {
  const code=String(body.code||'').trim().toUpperCase(); const deviceId=String(body.deviceId||'').trim();
  if(!code||!deviceId)throw Object.assign(new Error('请输入激活码'),{status:400,code:'INVALID_LICENSE'});
  const item=database.codes.find(entry=>entry.code===code);
  if(!item||item.revoked)throw Object.assign(new Error('激活码不存在或已作废'),{status:404,code:'INVALID_LICENSE'});
  if(item.deviceId&&item.deviceId!==deviceId)throw Object.assign(new Error('该激活码已绑定其他设备'),{status:409,code:'DEVICE_MISMATCH'});
  if(!item.deviceId){item.deviceId=deviceId;item.activatedAt=new Date().toISOString();item.expiresAt=new Date(Date.now()+item.days*86400000).toISOString();await saveDatabase()}
  const state=activationState(item,deviceId);
  if(state.expired)throw Object.assign(new Error('激活码已过期'),{status:403,code:'LICENSE_EXPIRED'});
  return state;
}

function reserveLicense(code, deviceId) {
  const item=database.codes.find(entry=>entry.code===String(code||'').toUpperCase());
  if(!item)throw Object.assign(new Error('请先使用有效激活码激活产品'),{status:403,code:'LICENSE_REQUIRED'});
  const state=activationState(item,String(deviceId||''));
  if(item.deviceId!==deviceId)throw Object.assign(new Error('激活码与当前设备不匹配'),{status:403,code:'DEVICE_MISMATCH'});
  if(state.expired||item.revoked)throw Object.assign(new Error('激活码已过期或作废'),{status:403,code:'LICENSE_EXPIRED'});
  const pending=pendingAi.get(item.code)||0;
  if(state.remainingAiCount-pending<=0)throw Object.assign(new Error('AI 次数已用完'),{status:403,code:'AI_QUOTA_EXHAUSTED'});
  pendingAi.set(item.code,pending+1); return item;
}

async function settleLicense(item, success) {
  pendingAi.set(item.code,Math.max(0,(pendingAi.get(item.code)||1)-1));
  if(success){item.usedAiCount=Math.min(item.totalAiQuota,item.usedAiCount+1);await saveDatabase()}
}

async function handleAdmin(req, res, pathname) {
  if(req.method==='POST'&&pathname==='/api/admin/login'){
    const body=await readJson(req); const configured=process.env.ADMIN_PASSWORD||'';
    if(!configured)return json(res,503,{success:false,error:'服务器尚未配置 ADMIN_PASSWORD'});
    if(!safeEqual(body.password||'',configured))return json(res,401,{success:false,error:'管理员密码错误'});
    const token=randomBytes(32).toString('hex'); adminSessions.set(token,Date.now()+8*3600000);
    return json(res,200,{success:true},{'Set-Cookie':sessionCookie(req,token)});
  }
  if(req.method==='POST'&&pathname==='/api/admin/logout'){
    const token=cookies(req).comment_admin;if(token)adminSessions.delete(token);
    return json(res,200,{success:true},{'Set-Cookie':sessionCookie(req,'',0)});
  }
  if(!requireAdmin(req,res))return;
  if(req.method==='GET'&&pathname==='/api/admin/codes')return json(res,200,{success:true,data:{codes:database.codes.map(publicCode).reverse()}});
  if(req.method==='POST'&&pathname==='/api/admin/codes'){
    const body=await readJson(req); const count=Math.min(100,Math.max(1,Number(body.count)||1)); const days=Math.min(3650,Math.max(1,Number(body.days)||15)); const quota=Math.min(100000,Math.max(0,Number(body.quota)||200));
    const created=Array.from({length:count},()=>({code:newCode(),days,totalAiQuota:quota,usedAiCount:0,deviceId:null,createdAt:new Date().toISOString(),activatedAt:null,expiresAt:null,revoked:false}));
    database.codes.push(...created);await saveDatabase();return json(res,201,{success:true,data:{codes:created.map(publicCode)}});
  }
  if(req.method==='DELETE'&&pathname.startsWith('/api/admin/codes/')){
    const code=decodeURIComponent(pathname.slice('/api/admin/codes/'.length)).toUpperCase();const item=database.codes.find(entry=>entry.code===code);
    if(!item)return json(res,404,{success:false,error:'激活码不存在'});item.revoked=true;await saveDatabase();return json(res,200,{success:true,data:{code:publicCode(item)}});
  }
  return json(res,404,{success:false,error:'接口不存在'});
}

async function handleLicense(req,res,pathname){
  try{
    const body=await readJson(req);
    if(pathname==='/api/license/activate'){const activation=await activateLicense(body);return json(res,200,{success:true,data:{activation}})}
    if(pathname==='/api/license/status'){
      const item=database.codes.find(entry=>entry.code===String(body.code||'').toUpperCase());
      if(!item)return json(res,404,{success:false,code:'INVALID_LICENSE',error:'激活码不存在'});
      return json(res,200,{success:true,data:{activation:activationState(item,String(body.deviceId||''))}});
    }
  }catch(error){return json(res,error.status||400,{success:false,code:error.code||'LICENSE_ERROR',error:error.message||'激活失败'})}
}

async function handleAi(req,res,mode){
  if(!allowRequest(req.socket.remoteAddress||'local'))return json(res,429,{success:false,error:'请求过于频繁，请稍后再试'});
  let license;
  try{
    const body=await readJson(req); license=reserveLicense(body.licenseCode,body.deviceId);
    const apiKey=process.env.AI_API_KEY;const baseUrl=(process.env.AI_API_BASE_URL||'https://api.deepseek.com/v1').replace(/\/$/,'');
    if(!apiKey)throw Object.assign(new Error('服务端尚未配置 AI_API_KEY'),{status:503,code:'AI_NOT_CONFIGURED'});
    const student=body.student||{};const showStudentName=body.showStudentName!==false;const target=Math.min(500,Math.max(80,Number(body.targetLength)||150));
    const system=mode==='polish'?'你是一名有经验的中小学班主任。请润色评语，语言自然真诚、温和，不要出现 AI、标签或系统等字样，只输出评语正文。':'你是一名中小学班主任。请根据学生信息重写一段期末评语，先肯定优点，再委婉提出建议，最后表达期待，只输出正文。';
    const user=JSON.stringify({姓名:showStudentName?student.name:'正文中不要出现学生姓名',是否显示姓名:showStudentName,性别:student.gender,类型:student.type,表现标签:Object.values(student.tags||{}).flat(),补充说明:student.note,原评语:body.baseComment,语气:body.tone||'温和鼓励',目标字数:target,格式要求:showStudentName?'正文开头自然带上学生姓名':'正文中不得出现学生姓名，也不要用“某某同学”等占位符'});
    const models=[...new Set([process.env.AI_MODEL||'deepseek-chat',process.env.AI_FALLBACK_MODEL].filter(Boolean))];let lastError='';
    for(const model of models){
      const upstream=await fetch(`${baseUrl}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:user}],temperature:Number(process.env.AI_TEMPERATURE||.7),max_tokens:Number(process.env.AI_MAX_OUTPUT_TOKENS||600)})});
      const result=await upstream.json().catch(()=>({}));if(!upstream.ok){lastError=result?.error?.message||`AI 接口错误 ${upstream.status}`;continue}
      let comment=result?.choices?.[0]?.message?.content?.trim();if(comment&&!showStudentName&&student.name)comment=comment.replaceAll(`${student.name}同学，`,'').replaceAll(`${student.name}同学`,'').replaceAll(student.name,'').trim();
      if(comment){await settleLicense(license,true);return json(res,200,{success:true,data:{comment:comment.slice(0,500),model,activation:activationState(license,body.deviceId)}})}lastError='模型返回内容为空';
    }
    throw new Error(lastError||'AI 请求失败');
  }catch(error){if(license)await settleLicense(license,false);return json(res,error.status||502,{success:false,code:error.code,error:error.message||'AI 请求失败'})}
}

await loadDatabase();
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||'/','http://localhost');const pathname=decodeURIComponent(url.pathname);
    if(pathname.startsWith('/api/admin/'))return await handleAdmin(req,res,pathname);
    if(req.method==='POST'&&pathname.startsWith('/api/license/'))return await handleLicense(req,res,pathname);
    if(req.method==='POST'&&pathname==='/api/comment/ai-polish')return await handleAi(req,res,'polish');
    if(req.method==='POST'&&pathname==='/api/comment/ai-rewrite')return await handleAi(req,res,'rewrite');
    if(pathname==='/api/health')return json(res,200,{ok:true,aiConfigured:Boolean(process.env.AI_API_KEY),model:process.env.AI_MODEL||'deepseek-chat',fallbackModel:process.env.AI_FALLBACK_MODEL||null});
    let file=normalize(join(root,pathname==='/'?'index.html':pathname));if(!file.startsWith(root))throw new Error('invalid path');
    try{if((await stat(file)).isDirectory())file=join(file,'index.html')}catch{file=join(root,'index.html')}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch(error){console.error(error);json(res,404,{success:false,error:'Not found'})}
}).listen(port,'0.0.0.0',()=>console.log(`Server ready on port ${port}`));
