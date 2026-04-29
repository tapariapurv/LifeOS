const state = {classes:[],category_groups:[],categories:[],tasks:[],notes:[],goals:[],prompts:[]};
const tabs = ["Task","Class","Goal","Category","Prompt"];

async function api(path, method='GET', body){
  const res = await fetch(path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  return res.json();
}

function byId(id){return document.getElementById(id)}
function formatDate(d){return new Date(d).toLocaleDateString()}

function render(){
  byId('todayLabel').textContent = new Date().toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'});
  byId('sidebarNav').innerHTML = ['Dashboard','Tasks','Classes','Goals','Notes','Knowledge','Prompts'].map((x,i)=>`<a class="sidebar-item ${i===0?'active':''}" href="#">${x}</a>`).join('');
  byId('tasks').innerHTML = state.tasks.map(t=>`<div class="task-item"><strong>${t.title}</strong> <span class="badge">${t.type}</span><div>${t.description||''}</div><small>${t.due_date?formatDate(t.due_date):'No due date'}</small></div>`).join('');
  byId('classes').innerHTML = state.classes.map(c=>`<div class="class-block" style="border-left:6px solid ${c.color}"><strong>${c.name}</strong> <span class="badge">${c.type}</span><div>${c.time||''} ${c.room?`· ${c.room}`:''}</div></div>`).join('');
  byId('goals').innerHTML = state.goals.map(g=>`<div><strong>${g.title}</strong><div class="progress"><span style="width:${g.progress}%"></span></div></div>`).join('');
  byId('notes').innerHTML = state.notes.map(n=>`<div class="note-item">${n.content}</div>`).join('');
  byId('prompts').innerHTML = filteredPrompts().map(p=>`<div class="prompt-item"><strong>${p.title}</strong><p>${p.content}</p><button class="btn copy-btn" data-content="${encodeURIComponent(p.content)}">Copy</button></div>`).join('') || '<p>No prompts.</p>';
  bindCopyButtons();

  byId('tabs').innerHTML = tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${t}">${t}</button>`).join('');
  initTabClicks();
  renderForm('Task');
}

function filteredPrompts(){
  const q = (byId('promptSearch').value || '').toLowerCase();
  return state.prompts.filter(p => [p.title,p.content,p.tags||''].join(' ').toLowerCase().includes(q));
}

function initTabClicks(){
  document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');renderForm(btn.dataset.tab);});
}

function options(list, label='name'){ return `<option value="">--</option>` + list.map(x=>`<option value="${x.id}">${x[label]}</option>`).join('') }

function renderForm(tab){
  const area=byId('formArea');
  if(tab==='Task') area.innerHTML = `<div class="form-grid"><input class="input" id="tTitle" placeholder="Title"><input class="input" id="tDue" type="date"><select id="tType"><option>Task</option><option>Homework</option></select><input class="input" id="tDesc" placeholder="Description"><select id="tClass">${options(state.classes)}</select><select id="tCat">${options(state.categories)}</select></div><button class="btn" id="saveTask">Save Task</button>`;
  if(tab==='Class') area.innerHTML = `<div class="form-grid"><input class="input" id="cName" placeholder="Class name"><input class="input" id="cTime" placeholder="09:00 AM"><input class="input" id="cRoom" placeholder="Room"><select id="cType"><option value="regular">regular</option><option value="cover-up">cover-up</option></select><input class="input" id="cColor" type="color" value="#78a9ff"><select id="cDay"><option value="">One-time</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div><button class="btn" id="saveClass">Save Class</button>`;
  if(tab==='Goal') area.innerHTML = `<div class="form-grid"><input class="input" id="gTitle" placeholder="Goal"><input class="input" id="gProgress" type="number" min="0" max="100" placeholder="Progress %"></div><button class="btn" id="saveGoal">Save Goal</button>`;
  if(tab==='Category') area.innerHTML = `<div class="form-grid"><input class="input" id="cgName" placeholder="Group name"><button class="btn" id="saveGroup">Add Group</button><input class="input" id="catName" placeholder="Category name"><input class="input" id="catColor" type="color" value="#8ea8ff"><select id="catGroup">${options(state.category_groups)}</select></div><button class="btn" id="saveCategory">Save Category</button>`;
  if(tab==='Prompt') area.innerHTML = `<div class="form-grid"><input class="input" id="pTitle" placeholder="Title"><input class="input" id="pTags" placeholder="Tags"><select id="pCat">${options(state.categories)}</select><textarea id="pContent" placeholder="Prompt content"></textarea></div><button class="btn" id="savePrompt">Save Prompt</button>`;
  bindFormActions();
}

function bindFormActions(){
  byId('saveTask')?.addEventListener('click',async ()=>{const type=byId('tType').value; await api('/api/tasks','POST',{title:byId('tTitle').value,description:byId('tDesc').value,due_date:byId('tDue').value||null,type,status:'todo',class_id:type==='Homework'?(byId('tClass').value||null):null,category_id:type==='Task'?(byId('tCat').value||null):null}); await load();});
  byId('saveClass')?.addEventListener('click',async ()=>{await api('/api/classes','POST',{name:byId('cName').value,time:byId('cTime').value,room:byId('cRoom').value,type:byId('cType').value,color:byId('cColor').value,recurring_day:byId('cDay').value||null}); await load();});
  byId('saveGoal')?.addEventListener('click',async ()=>{await api('/api/goals','POST',{title:byId('gTitle').value,progress:Number(byId('gProgress').value||0)}); await load();});
  byId('saveGroup')?.addEventListener('click',async ()=>{await api('/api/category_groups','POST',{name:byId('cgName').value}); await load();});
  byId('saveCategory')?.addEventListener('click',async ()=>{await api('/api/categories','POST',{name:byId('catName').value,color:byId('catColor').value,parent_group_id:byId('catGroup').value||null}); await load();});
  byId('savePrompt')?.addEventListener('click',async ()=>{await api('/api/prompts','POST',{title:byId('pTitle').value,content:byId('pContent').value,tags:byId('pTags').value,category_id:byId('pCat').value||null}); await load();});
}

async function load(){Object.assign(state, await api('/api/bootstrap')); render();}

byId('addNoteBtn')?.addEventListener('click', async ()=>{const content=byId('noteInput').value.trim(); if(!content)return; await api('/api/notes','POST',{content}); byId('noteInput').value=''; await load();});
byId('promptSearch')?.addEventListener('input', ()=>{byId('prompts').innerHTML = filteredPrompts().map(p=>`<div class="prompt-item"><strong>${p.title}</strong><p>${p.content}</p><button class="btn copy-btn" data-content="${encodeURIComponent(p.content)}">Copy</button></div>`).join(''); bindCopyButtons();});
load();

function bindCopyButtons(){document.querySelectorAll('.copy-btn').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(decodeURIComponent(b.dataset.content||'')));}
