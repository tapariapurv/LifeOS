const data = {
  nav:['Home','Tasks','Classes','Goals','Notes','Analytics'],
  overview:{tasks:8,homework:5,classes:4,focus:'3.5h',progress:75},
  taskGroups:[
    {name:'Mathematics',color:'#7a5ef5',items:[['Problem Set 7','Due Tomorrow'],['Chapter 5 Practice','Due May 25']]},
    {name:'Physics',color:'#3d92ff',items:[['Lab Report','Due May 26']]},
    {name:'Computer Science',color:'#29c36a',items:[['Project Documentation','Due May 28'],['Algorithms Assignment','Due May 30']]}
  ],
  classes:[['8:00 AM','Mathematics','Room 101','#eee7fb','#7a5ef5'],['10:00 AM','Physics','Lab Room 2','#e7f1ff','#3d92ff'],['11:00 AM','Computer Science','Room 203','#eaf8ef','#22bf65'],['1:00 PM','English Literature','Room 105','#fbf6e6','#f0ad2d'],['3:00 PM','Cover-up Class','Room 150','#f3f6f9','#95a5b2']],
  goals:[['Learn Python',75],['Build Robotics Project',60],['Read 12 Books',42],['Improve Math Skills',80]],
  notes:[['Robot design ideas','2 min ago'],['Stock market analysis','1h ago'],['AI research paper summary','3h ago']],
  upcoming:[['Lab Report','Physics','May 26','#3d92ff'],['Project Documentation','Computer Science','May 28','#29c36a'],['Algorithms Assignment','Computer Science','May 30','#29c36a'],['English Essay','English Literature','Jun 2','#f0ad2d']]
};

function render(){
  document.getElementById('nav').innerHTML = data.nav.map((n,i)=>`<button class="nav-item ${i===0?'active':''}">◉<span>${n}</span></button>`).join('');
  document.getElementById('overview').innerHTML = `<h2>Today's Overview</h2><div class="overview-grid"><div class="stat"><div class="label">Tasks</div><div class="k">${data.overview.tasks}</div><div class="label">Total</div></div><div class="stat"><div class="label">Homework</div><div class="k">${data.overview.homework}</div><div class="label">Due</div></div><div class="stat"><div class="label">Classes</div><div class="k">${data.overview.classes}</div><div class="label">Today</div></div><div class="stat"><div class="label">Focus Time</div><div class="k">${data.overview.focus}</div><div class="label">Planned</div></div><div><div class="progress-ring">${data.overview.progress}%</div><div style="margin-top:8px;font-weight:700">Daily Progress</div><div class="label">Great progress! Keep it up.</div></div></div>`;
  document.getElementById('quickCapture').innerHTML = `<h2>Quick Capture</h2><div class="quick-input"><input placeholder="Write a quick note..."/><button>✎</button></div>`;
  document.getElementById('tasksBoard').innerHTML = `<div class="row"><h2>Tasks Overview</h2><div class="tabs"><span class="tab active">Homework</span><span class="tab">Tasks</span></div></div><div class="row"><div class="label">Grouped by: <b>Class</b></div><div><button class="btn-ghost btn">Filter</button> <button class="btn">+ Add Task</button></div></div><div>${data.taskGroups.map(g=>`<div class="class-group"><div><span style="color:${g.color}">●</span> <b>${g.name}</b></div>${g.items.map(i=>`<div class="task-line"><span>${i[0]}</span><span style="color:#e6a24b">${i[1]}</span></div>`).join('')}</div>`).join('')}</div>`;
  document.getElementById('goals').innerHTML = `<div class="row"><h2>Goals</h2><a>View All</a></div>${data.goals.map(g=>`<div class="goal-item"><div class="logo" style="width:44px;height:44px;border-radius:12px">⌁</div><div><b>${g[0]}</b><div class="bar"><span style="width:${g[1]}%"></span></div></div><b>${g[1]}%</b></div>`).join('')}<a>+ Add Goal</a>`;
  document.getElementById('recentNotes').innerHTML = `<div class="row"><h2>Recent Notes</h2><a>View All</a></div>${data.notes.map(n=>`<div class="note"><span>• ${n[0]}</span><span>${n[1]}</span></div>`).join('')}<a>+ New Note</a>`;
  document.getElementById('upcoming').innerHTML = `<div class="row"><h2>Upcoming Tasks</h2><a>View All</a></div><div class="overview-grid">${data.upcoming.map(t=>`<div class="card" style="padding:14px"><div><span style="color:${t[3]}">●</span> <b>${t[0]}</b></div><div class="label">${t[1]}</div><div style="color:#dc9d53;font-weight:700">${t[2]}</div></div>`).join('')}</div>`;
  document.getElementById('tasksBoard').insertAdjacentHTML('beforeend', `<hr/><h2>Classes Today</h2><div class="row"><b>May 20, 2024</b><b>Monday</b></div>${data.classes.map(c=>`<div class="time-row"><div class="label">${c[0]}</div><div class="event" style="background:${c[3]};border-left-color:${c[4]}"><b>${c[1]}</b><div>${c[2]}</div></div></div>`).join('')}`)
}
render();
