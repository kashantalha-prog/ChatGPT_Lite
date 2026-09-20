const $=id=>document.getElementById(id);
const KEY='chatgpt-lite-gemini-v1';
const LANG_KEY='chatgpt-lite-language';
const API_BASE=(window.CHATGPT_CONFIG?.backendUrl||'').replace(/\/$/,'');
let language=localStorage.getItem(LANG_KEY)||'en';
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{theme:'dark',chats:[],current:0};
function t(key,values={}){let value=(window.CHATGPT_LOCALES[language]||window.CHATGPT_LOCALES.en)[key]||key;return Object.entries(values).reduce((text,[name,replacement])=>text.replaceAll(`{${name}}`,replacement),value);}
function applyLanguage(){const locale=window.CHATGPT_LOCALES[language]||window.CHATGPT_LOCALES.en;document.documentElement.lang=language;document.documentElement.dir=locale.direction;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-title]').forEach(el=>el.title=t(el.dataset.i18nTitle));document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAriaLabel)));$('instructions').value=t('instructions');$('languageSelect').value=language;render();}
if(!state.chats.length) state.chats=[{id:Date.now(),title:'New chat',messages:[]}];
if(state.current>=state.chats.length) state.current=0;
let busy=false,aborter=null,think=false,attachments=[];
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function current(){return state.chats[state.current];}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function formatText(s){let x=esc(s);x=x.replace(/```([\s\S]*?)```/g,'<pre>$1</pre>');x=x.replace(/`([^`]+)`/g,'<code>$1</code>');x=x.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');return x.replace(/\n/g,'<br>');}
function renderHistory(){
 $('history').innerHTML=state.chats.map((c,i)=>`<div class="historyItem ${i===state.current?'active':''}" data-i="${i}"><span>💬</span><span class="historyTitle">${esc(c.title==='New chat'?t('newChat'):(c.title||t('newChat')))}</span><button class="historyMore" data-del="${i}" title="${t('delete')}">•••</button></div>`).join('');
 document.querySelectorAll('.historyItem').forEach(el=>el.onclick=e=>{if(e.target.dataset.del!==undefined)return;state.current=+el.dataset.i;save();render();closeMenu();});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.del;if(state.chats.length===1)state.chats=[{id:Date.now(),title:'New chat',messages:[]}],state.current=0;else{state.chats.splice(i,1);if(state.current>=state.chats.length)state.current=state.chats.length-1}save();render();});
}
function render(){
 document.body.classList.toggle('light',state.theme==='light');renderHistory();const box=$('messages'),c=current();
 if(!c.messages.length){box.innerHTML=`<div class="welcome"><div class="welcomeLogo">✦</div><h1>${t('welcomeTitle')}</h1><p>${t('welcomeText')}</p></div>`;return;}
 box.innerHTML=c.messages.map((m,i)=>`<div class="msg ${m.role}"><div class="msgAvatar">${m.role==='user'?'YOU':'C'}</div><div class="msgBody"><div class="bubble">${m.attachments?.length?`<div style="margin-bottom:8px;color:#aaa;font-size:12px">📎 ${m.attachments.map(esc).join(', ')}</div>`:''}${formatText(m.content)}</div>${m.role==='assistant'?`<div class="actions"><button data-copy="${i}">${t('copy')}</button><button data-speak="${i}">🔊</button><button data-like="${i}">👍</button><button data-regen="${i}">↻</button></div>`:''}</div></div>`).join('');box.scrollTop=box.scrollHeight;
 box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>navigator.clipboard?.writeText(c.messages[+b.dataset.copy].content));
 box.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(c.messages[+b.dataset.speak].content));
 box.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>b.textContent='✓');
 box.querySelectorAll('[data-regen]').forEach(b=>b.onclick=()=>regenerate(+b.dataset.regen));
}
function closeMenu(){$('moreMenu').classList.remove('show');}
$('dotsBtn').onclick=e=>{e.stopPropagation();$('moreMenu').classList.toggle('show');};document.addEventListener('click',e=>{if(!e.target.closest('.menuWrap'))closeMenu();});
$('menuToggle').onclick=()=>$('sidebar').classList.toggle('open');
$('newChat').onclick=()=>{state.chats.unshift({id:Date.now(),title:t('newChat'),messages:[]});state.current=0;save();render();$('prompt').focus();$('sidebar').classList.remove('open');};
$('shareBtn').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('shareBtn').innerHTML='✓ <span>'+t('copied')+'</span>';setTimeout(()=>$('shareBtn').innerHTML='↗ <span>'+t('share')+'</span>',1300)}catch{alert(t('shareFailed'))}};
$('themeToggle').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();render();closeMenu();};
$('deleteChat').onclick=()=>{if(!confirm(t('deleteConfirm')))return;if(state.chats.length===1)current().messages=[];else{state.chats.splice(state.current,1);state.current=0}save();render();closeMenu();};
$('archiveChat').onclick=()=>{current().archived=true;save();closeMenu();alert(t('archived'));};
$('pinChat').onclick=()=>{current().pinned=!current().pinned;save();closeMenu();alert(current().pinned?t('pinned'):t('unpinned'));};
$('exportChat').onclick=()=>{const blob=new Blob([JSON.stringify(current(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(current().title||'chat')+'.json';a.click();URL.revokeObjectURL(a.href);closeMenu();};
$('viewFiles').onclick=()=>{alert(attachments.length?t('currentFiles',{files:attachments.map(f=>f.name).join(', ')}):t('noFiles'));closeMenu();};
$('filesBtn').onclick=()=>alert(t('attachHelp'));
$('searchBtn').onclick=()=>{const q=prompt(t('searchPrompt'));if(!q)return;const i=state.chats.findIndex(c=>(c.title||'').toLowerCase().includes(q.toLowerCase())||c.messages.some(m=>m.content.toLowerCase().includes(q.toLowerCase())));if(i<0)return alert(t('noMatch'));state.current=i;save();render();};
$('settingsBtn').onclick=()=>{closeMenu();alert(t('serverSetup'));};
$('profileSettings').onclick=()=>{$('settingsModal').classList.add('show');};
$('closeSettings').onclick=()=>$('settingsModal').classList.remove('show');$('cancelSettings').onclick=()=>$('settingsModal').classList.remove('show');$('settingsModal').onclick=e=>{if(e.target===$('settingsModal'))$('settingsModal').classList.remove('show')};
$('saveSettings').onclick=()=>{$('settingsModal').classList.remove('show');alert(t('saveSetup'));};
$('languageSelect').onchange=e=>{language=e.target.value;localStorage.setItem(LANG_KEY,language);applyLanguage();};
$('attach').onclick=()=>$('fileInput').click();
$('fileInput').onchange=()=>{attachments=[...$('fileInput').files];renderAttachmentHint();};
function renderAttachmentHint(){let old=document.getElementById('attachmentHint');if(old)old.remove();if(!attachments.length)return;const d=document.createElement('div');d.id='attachmentHint';d.style.cssText='max-width:850px;margin:5px auto 0;color:#aaa;font-size:12px;padding:0 8px';d.innerHTML='📎 '+attachments.map(f=>esc(f.name)).join(', ')+' <button id="clearAttach" style="border:0;background:none;color:#aaa;cursor:pointer">×</button>';document.querySelector('.composerArea').prepend(d);$('clearAttach').onclick=()=>{attachments=[];$('fileInput').value='';renderAttachmentHint();};}
$('thinkBtn').onclick=()=>{think=!think;$('thinkBtn').classList.toggle('active',think);$('thinkBtn').title=think?t('thinkModeOn'):t('thinkMode');};
function speak(text){if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text));}}
let recognition=null;if('SpeechRecognition'in window||'webkitSpeechRecognition'in window){const R=window.SpeechRecognition||window.webkitSpeechRecognition;recognition=new R();recognition.lang='en-US';recognition.interimResults=false;recognition.onresult=e=>{$('prompt').value+=($('prompt').value?' ':'')+e.results[0][0].transcript;autoSize();};recognition.onend=()=>$('voiceBtn').classList.remove('active');}
$('voiceBtn').onclick=()=>{if(!recognition)return alert(t('voiceUnsupported'));$('voiceBtn').classList.add('active');recognition.start();};
function autoSize(){const p=$('prompt');p.style.height='auto';p.style.height=Math.min(p.scrollHeight,180)+'px';}$('prompt').addEventListener('input',autoSize);
$('prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});$('sendBtn').onclick=send;
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
async function callAI(text,files,history,signal){
 const imageFiles=files.filter(f=>f.type.startsWith('image/')).slice(0,4);
 if(files.some(f=>!f.type.startsWith('image/'))) throw new Error(t('imageOnly'));
 const images=[];for(const f of imageFiles){if(f.size>10*1024*1024)throw new Error(t('imageTooLarge',{name:f.name}));images.push({name:f.name,data:await fileToBase64(f)});}
 const payload={message:text||t('analyzeImages'),history:history.slice(-20),images,think};
 const r=await fetch(`${API_BASE}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
 let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.error||`Server error (${r.status})`);return d;
}
async function send(){if(busy)return;const p=$('prompt'),text=p.value.trim();if(!text&&!attachments.length)return;const c=current();const fileNames=attachments.map(f=>f.name);c.messages.push({role:'user',content:text||t('analyzeImages'),attachments:fileNames});if(c.title==='New chat')c.title=(text||fileNames[0]||'Image chat').slice(0,40);p.value='';autoSize();save();render();busy=true;aborter=new AbortController();$('sendBtn').textContent='■';$('sendBtn').classList.add('stop');$('sendBtn').onclick=()=>aborter.abort();const filesNow=attachments;attachments=[];$('fileInput').value='';renderAttachmentHint();const typing=document.createElement('div');typing.className='msg';typing.innerHTML='<div class="msgAvatar">C</div><div class="msgBody"><div class="typing"><i></i><i></i><i></i></div></div>';$('messages').appendChild(typing);$('messages').scrollTop=$('messages').scrollHeight;
 try{const result=await callAI(text,filesNow,c.messages.slice(0,-1),aborter.signal);typing.remove();c.messages.push({role:'assistant',content:result.text||t('noResponse')});save();render();}
 catch(e){typing.remove();if(e.name!=='AbortError'){c.messages.push({role:'assistant',content:'⚠️ '+e.message});save();render();}}
 finally{busy=false;aborter=null;$('sendBtn').textContent='↑';$('sendBtn').classList.remove('stop');$('sendBtn').onclick=send;}
}
async function regenerate(index){const c=current();if(busy||index<1)return;const user=[...c.messages].slice(0,index).reverse().find(m=>m.role==='user');if(!user)return;c.messages=c.messages.slice(0,index);save();render();$('prompt').value=user.content;attachments=[];await send();}
applyLanguage();$('prompt').focus();
