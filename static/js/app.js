const state = {classes:[],category_groups:[],categories:[],tasks:[],notes:[],goals:[],prompts:[]};
const tabs = ["Task","Class","Goal","Category","Prompt"];

const STORAGE_KEY='lifeos-demo-state-v1';

async function api(path, method='GET', body){
  if(window.__localMode){
    return localApi(path,method,body);
  }
  const res = await fetch(path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error('API error');
  return res.json();
}
const $ = (id)=>document.getElementById(id);
const fmtDate=(d)=>d?new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'No due';

function render(){
  renderSidebar(); renderStats(); renderTasksPanel(); renderClassesPanel(); renderRightPanel(); renderPrompts(); renderTabs();
}
function renderSidebar(){ $('sidebarNav').innerHTML=['🏠 Home','✓ Tasks','🗓 Classes','🎯 Goals','📝 Notes','📚 Knowledge','🤖 Prompts'].map((n,i)=>`<button class="sidebar-item ${i===0?'active':''}">${n}</button>`).join(''); }
function renderStats(){
  const homework = state.tasks.filter(t=>t.type==='Homework').length;
  const tasks = state.tasks.filter(t=>t.type==='Task').length;
  const todayClasses = state.classes.length;
  $('statsRow').innerHTML = [['TASKS',tasks,'Total'],['HOMEWORK',homework,'Due'],['CLASSES',todayClasses,'Today'],['FOCUS TIME','3.5h','Planned']].map((s,i)=>`<div class="card stat-card" ${i===1?'style="border-color:#4aa7eb"':''}><h4>${s[0]}</h4><div class="stat-value">${s[1]}</div><div>${s[2]}</div></div>`).join('');
}
function renderTasksPanel(){
  const groups = ['Class','Category','Date'];
  const items = state.tasks.map(t=>`<div class="item"><div><strong>${t.title}</strong> <span class="badge">${t.type}</span></div><div>${t.description||''}</div><small>${fmtDate(t.due_date)} · ${t.status}</small></div>`).join('') || '<p>No tasks yet</p>';
  $('tasksPanel').innerHTML = `<div class="panel-head"><h3>Tasks Overview</h3><button class="btn" id="taskQuick">+ Add Task</button></div><div class="panel-head"><label>Grouped by:</label><select id="taskGroup">${groups.map(g=>`<option>${g}</option>`).join('')}</select></div><div>${items}</div>`;
}
function renderClassesPanel(){
  const blocks = state.classes.map(c=>`<div class="item" style="border-left:6px solid ${c.color}"><strong>${c.name}</strong> <span class="badge">${c.type}</span><div>${c.time||''} ${c.room?`· ${c.room}`:''}</div></div>`).join('') || '<p>No classes today</p>';
  $('classesPanel').innerHTML = `<div class="panel-head"><h3>Classes Today</h3><button class="btn ghost" id="classQuick">+ Add Class</button></div>${blocks}`;
}
function renderRightPanel(){
  $('rightStack').innerHTML = `<section class="card panel"><h3>Goals</h3>${state.goals.map(g=>`<div class="item"><strong>${g.title}</strong><div class="progress"><span style="width:${Math.max(0,Math.min(100,g.progress||0))}%"></span></div></div>`).join('')||'<p>No goals yet</p>'}</section>
  <section class="card panel"><h3>Quick Notes</h3><div class="panel-head"><input id="noteInput" class="input" placeholder="Capture a note instantly"><button class="btn" id="addNoteBtn">Add</button></div>${state.notes.map(n=>`<div class="item">${n.content}</div>`).join('')||'<p>No notes yet</p>'}</section>`;
  $('addNoteBtn').onclick=addNote;
}
function renderPrompts(){
  const q=($('promptSearch').value||'').toLowerCase();
  const list=state.prompts.filter(p=>[p.title,p.content,p.tags||''].join(' ').toLowerCase().includes(q));
  $('prompts').innerHTML = list.map(p=>`<div class="item"><div class="panel-head"><strong>${p.title}</strong><small>${p.created_at||''}</small></div><p>${p.content}</p><small>${p.tags||''}</small><div><button class="btn ghost copy-btn" data-copy="${encodeURIComponent(p.content)}">Copy</button> <button class="btn ghost del-prompt" data-id="${p.id}">Delete</button></div></div>`).join('') || '<p>No prompts found.</p>';
  document.querySelectorAll('.copy-btn').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(decodeURIComponent(b.dataset.copy||'')));
  document.querySelectorAll('.del-prompt').forEach(b=>b.onclick=async()=>{await api(`/api/prompts/${b.dataset.id}`,'DELETE'); await load();});
}
function renderTabs(){ $('tabs').innerHTML=tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${t}">${t}</button>`).join(''); document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');renderForm(t.dataset.tab)}); renderForm('Task'); }
function options(list){ return `<option value="">--</option>`+list.map(x=>`<option value="${x.id}">${x.name}</option>`).join(''); }

function renderForm(tab){
  if(tab==='Task') $('formArea').innerHTML = `<div class="form-grid"><input class="input" id="tTitle" placeholder="Title"><input class="input" id="tDue" type="date"><select id="tType"><option>Task</option><option>Homework</option></select><input class="input" id="tDesc" placeholder="Description"><select id="tClass">${options(state.classes)}</select><div><select id="tCat">${options(state.categories)}</select><input class="input" id="newCat" placeholder="Or create category"></div><select id="tStatus"><option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option></select></div><button class="btn" id="saveTask">Save Task</button>`;
  if(tab==='Class') $('formArea').innerHTML = `<div class="form-grid"><input class="input" id="cName" placeholder="Class name"><input class="input" id="cTime" placeholder="10:30 AM"><input class="input" id="cRoom" placeholder="Room optional"><select id="cType"><option value="regular">regular</option><option value="cover-up">cover-up</option></select><input id="cColor" type="color" value="#3c97df"><select id="cDay"><option value="">One-time</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select></div><button class="btn" id="saveClass">Save Class</button>`;
  if(tab==='Goal') $('formArea').innerHTML = `<div class="form-grid"><input class="input" id="gTitle" placeholder="Goal title"><input class="input" id="gProgress" type="number" min="0" max="100" placeholder="Progress"></div><button class="btn" id="saveGoal">Save Goal</button>`;
  if(tab==='Category') $('formArea').innerHTML = `<div class="form-grid"><input class="input" id="cgName" placeholder="Group name"><button class="btn" id="saveGroup">Add Group</button><input class="input" id="catName" placeholder="Category name"><input id="catColor" type="color" value="#72b8ee"><select id="catGroup">${options(state.category_groups)}</select></div><button class="btn" id="saveCategory">Save Category</button>`;
  if(tab==='Prompt') $('formArea').innerHTML = `<div class="form-grid"><input class="input" id="pTitle" placeholder="Prompt title"><input class="input" id="pTags" placeholder="Tags comma separated"><select id="pCat">${options(state.categories)}</select><textarea id="pContent" class="input" placeholder="Prompt content"></textarea></div><button class="btn" id="savePrompt">Save Prompt</button>`;
  bindFormActions();
  bindTaskTypeToggle();
}
function bindTaskTypeToggle(){ const t=$('tType'); if(!t) return; const c=$('tClass'),cat=$('tCat'),newCat=$('newCat'); const sync=()=>{const hw=t.value==='Homework'; c.disabled=!hw; cat.disabled=hw; newCat.disabled=hw;}; t.onchange=sync; sync(); }
async function bindFormActions(){
  $('saveTask')?.addEventListener('click', async ()=>{let catId=$('tCat').value||null; if($('tType').value==='Task' && $('newCat').value.trim()){const cat = await api('/api/categories','POST',{name:$('newCat').value.trim(),color:'#72b8ee'}); catId=cat.id;} await api('/api/tasks','POST',{title:$('tTitle').value,description:$('tDesc').value,type:$('tType').value,class_id:$('tType').value==='Homework'?($('tClass').value||null):null,category_id:$('tType').value==='Task'?catId:null,due_date:$('tDue').value||null,status:$('tStatus').value}); await load();});
  $('saveClass')?.addEventListener('click',async ()=>{await api('/api/classes','POST',{name:$('cName').value,time:$('cTime').value,room:$('cRoom').value,type:$('cType').value,color:$('cColor').value,recurring_day:$('cDay').value||null}); await load();});
  $('saveGoal')?.addEventListener('click',async ()=>{await api('/api/goals','POST',{title:$('gTitle').value,progress:Number($('gProgress').value||0)}); await load();});
  $('saveGroup')?.addEventListener('click',async ()=>{await api('/api/category_groups','POST',{name:$('cgName').value}); await load();});
  $('saveCategory')?.addEventListener('click',async ()=>{await api('/api/categories','POST',{name:$('catName').value,color:$('catColor').value,parent_group_id:$('catGroup').value||null}); await load();});
  $('savePrompt')?.addEventListener('click',async ()=>{await api('/api/prompts','POST',{title:$('pTitle').value,content:$('pContent').value,tags:$('pTags').value,category_id:$('pCat').value||null}); await load();});
}
async function addNote(){const content=$('noteInput').value.trim(); if(!content) return; await api('/api/notes','POST',{content,class_id:null,category_id:null}); await load();}
async function load(){
  try{
    Object.assign(state, await api('/api/bootstrap'));
  }catch(e){
    window.__localMode = true;
    Object.assign(state, await api('/api/bootstrap'));
  }
  render();
}
$('promptSearch').addEventListener('input', renderPrompts);
load();


function demoSeed(){return {classes:[{id:1,name:'Math',color:'#3c97df',time:'09:00 AM',type:'regular',room:'A12'}],category_groups:[{id:1,name:'School'},{id:2,name:'Personal'},{id:3,name:'Projects'}],categories:[{id:1,name:'Study',color:'#72b8ee',parent_group_id:1}],tasks:[{id:1,title:'Algebra worksheet',description:'Chapter 6 practice',type:'Homework',class_id:1,category_id:null,due_date:new Date().toISOString().slice(0,10),status:'todo'}],notes:[{id:1,content:'Review formulas after class',class_id:1,category_id:null}],goals:[{id:1,title:'Weekly consistency',progress:60}],prompts:[{id:1,title:'Summarize chapter',content:'Summarize chapter 6 into concise bullet points.',category_id:1,tags:'study,summary',created_at:new Date().toISOString().slice(0,10)}]};}
function readLocal(){const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):demoSeed();}
function writeLocal(st){localStorage.setItem(STORAGE_KEY,JSON.stringify(st));}
async function localApi(path,method='GET',body){let db=readLocal(); if(path==='/api/bootstrap') return db; const m=path.match(/^\/api\/(\w+)(?:\/(\d+))?$/); if(!m) return {}; const entity=m[1],id=m[2]?Number(m[2]):null; if(method==='POST'){const row={id:Date.now(),...(body||{})}; if(entity==='prompts'&&!row.created_at) row.created_at=new Date().toISOString().slice(0,10); db[entity].unshift?db[entity].unshift(row):db[entity].push(row); writeLocal(db); return row;} if(method==='DELETE'){db[entity]=db[entity].filter(x=>x.id!==id); writeLocal(db); return {ok:true};} return {}; }
