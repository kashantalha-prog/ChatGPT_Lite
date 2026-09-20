import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
function loadEnv(){
  const envPath=path.join(__dirname,'.env');
  if(!fs.existsSync(envPath)) return;
  for(const line of fs.readFileSync(envPath,'utf8').split(/\r?\n/)){
    const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if(m && !process.env[m[1]]) process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');
  }
}
loadEnv();
const PORT=Number(process.env.PORT||3000);
const HOST=process.env.HOST||'127.0.0.1';
const MODEL='gemini-3.5-flash-lite';
const CORS_ORIGIN=process.env.CORS_ORIGIN||'*';
const MAX_BODY=22*1024*1024;
const ai=process.env.GEMINI_API_KEY?new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY}):null;

function send(res,status,data,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':CORS_ORIGIN,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});res.end(type.startsWith('application/json')?JSON.stringify(data):data);}
function readBody(req){return new Promise((resolve,reject)=>{let n=0,chunks=[];req.on('data',c=>{n+=c.length;if(n>MAX_BODY){reject(new Error('Request is too large.'));req.destroy();return}chunks.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}catch(e){reject(new Error('Invalid JSON request.'))}});req.on('error',reject)});}
function historyToContents(history){return history.filter(m=>m && (m.role==='user'||m.role==='assistant')).slice(-20).map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:String(m.content||'')}]}));}
function dataUrlToPart(img){
  if(!img?.data || typeof img.data!=='string') throw new Error('Invalid image data.');
  const m=img.data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
  if(!m) throw new Error('Invalid image format.');
  const allowed=new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif']);
  if(!allowed.has(m[1])) throw new Error('Unsupported image type. Use JPG, PNG, WEBP, HEIC or HEIF.');
  if(Buffer.byteLength(m[2],'base64')>10*1024*1024) throw new Error('Image is larger than 10 MB.');
  return {inlineData:{mimeType:m[1],data:m[2]}};
}
async function handleChat(body){
  if(!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing. Open .env and add your Gemini API key, then restart npm start.');
  const text=String(body.message||'').slice(0,20000);
  const history=Array.isArray(body.history)?body.history:[];
  const images=Array.isArray(body.images)?body.images.slice(0,4):[];
  const contents=historyToContents(history);
  const userParts=[];
  for(const img of images) userParts.push(dataUrlToPart(img));
  userParts.push({text:text || 'Please analyze the attached image(s) and describe what you see.'});
  contents.push({role:'user',parts:userParts});
  const system='You are ChatGPT Lite, a helpful and accurate AI assistant. Answer clearly and naturally. Match the user language, including English, Urdu and Roman Urdu. Never claim certainty when uncertain. For images, carefully describe only what is visible and distinguish observations from guesses. Do not reveal hidden chain-of-thought. '+(body.think?'Use extra care on difficult reasoning, coding and calculations, but provide only the useful answer, not private chain-of-thought.':'');
  const response=await ai.models.generateContent({model:MODEL,contents,config:{systemInstruction:system,temperature:0.3}});
  const textOut=response.text||'';
  if(!textOut) throw new Error('Gemini returned an empty response.');
  return {text:textOut,model:MODEL};
}
function mime(file){const ext=path.extname(file).toLowerCase();return ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain'}[ext])||'application/octet-stream';}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==='OPTIONS'){send(res,204,'');return;}
  if(req.method==='GET' && (req.url==='/'||req.url==='/index.html')){send(res,200,fs.readFileSync(path.join(publicDir,'index.html'),'utf8'),'text/html; charset=utf-8');return;}
  if(req.method==='POST' && req.url==='/api/chat'){const body=await readBody(req);send(res,200,await handleChat(body));return;}
  if(req.method==='GET' && req.url.startsWith('/')){const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');if(rel && !rel.includes('..')){const fp=path.join(publicDir,rel);if(fs.existsSync(fp)&&fs.statSync(fp).isFile()){send(res,200,fs.readFileSync(fp),mime(fp));return;}}}
  send(res,404,{error:'Not found'});
 }catch(e){console.error(e);send(res,500,{error:e.message||'Server error'});}
});
server.listen(PORT,HOST,()=>console.log(`ChatGPT Lite running at http://${HOST}:${PORT} using ${MODEL}`));
