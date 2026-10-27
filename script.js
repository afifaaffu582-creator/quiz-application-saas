const $ = (id) => document.getElementById(id);
const today = new Date();
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const prettyDate = (date) => date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
$('today-date').textContent = prettyDate(today);
$('page-title').textContent = `${today.getHours()<12?'Good morning':today.getHours()<18?'Good afternoon':'Good evening'}! 👋`;
$('task-due').value = localDate(today);

const defaultTasks = [
 {id:1,title:'Review today’s class notes',subject:'General',due:localDate(today),done:false},
 {id:2,title:'Practice 10 mathematics problems',subject:'Mathematics',due:localDate(today),done:false},
 {id:3,title:'Read one chapter',subject:'English',due:localDate(today),done:true}
];
const defaultSchedule = [
 {id:1,time:'16:00',topic:'Mathematics revision'},
 {id:2,time:'17:00',topic:'Science reading'},
 {id:3,time:'18:00',topic:'Break & refresh'}
];
let tasks = load('studyflow-tasks',defaultTasks);
let schedule = load('studyflow-schedule',defaultSchedule);
let goals = load('studyflow-goals',[]);
let filter = 'all';
let nextId = () => Date.now() + Math.floor(Math.random()*1000);
function load(key,fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
function save(){localStorage.setItem('studyflow-tasks',JSON.stringify(tasks));localStorage.setItem('studyflow-schedule',JSON.stringify(schedule));localStorage.setItem('studyflow-goals',JSON.stringify(goals))}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderTasks(){
 const visible=tasks.filter(t=>filter==='all'||(filter==='pending'&&!t.done)||(filter==='done'&&t.done)).sort((a,b)=>a.due.localeCompare(b.due));
 $('task-list').innerHTML=visible.length?visible.map(t=>`<div class="task-row ${t.done?'done':''}"><input class="task-check" type="checkbox" data-task-check="${t.id}" ${t.done?'checked':''} aria-label="Complete ${escapeHtml(t.title)}"><div class="task-info"><span class="task-name">${escapeHtml(t.title)}</span><span class="task-meta">${escapeHtml(t.subject)} · Due ${escapeHtml(t.due)}</span></div><span class="tag">${t.done?'Done':'Task'}</span><button class="delete-btn" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`).join(''):'<div class="empty-state">No tasks here yet. Add a task to get started ✨</div>';
 $('completed-count').textContent=tasks.filter(t=>t.done).length;
 $('remaining-count').textContent=tasks.filter(t=>!t.done).length;
}
function renderSchedule(){
 schedule.sort((a,b)=>a.time.localeCompare(b.time));
 $('schedule-list').innerHTML=schedule.length?schedule.map(s=>`<div class="schedule-item"><span class="time-label">${escapeHtml(s.time)}</span><span class="schedule-dot"></span><span class="schedule-topic">${escapeHtml(s.topic)}</span><button class="delete-btn" data-schedule-delete="${s.id}" aria-label="Delete schedule item">×</button></div>`).join(''):'<div class="empty-state">Your schedule is empty.</div>';
}
function renderGoals(){
 $('goal-count').textContent=goals.length;
 $('goal-list').innerHTML=goals.length?goals.map(g=>`<label class="goal-item ${g.done?'done':''}"><input type="checkbox" data-goal-check="${g.id}" ${g.done?'checked':''}><span>${escapeHtml(g.title)}</span><button type="button" class="delete-btn" data-goal-delete="${g.id}" aria-label="Delete goal">×</button></label>`).join(''):'<div class="empty-state">No goals yet. Add one small goal for this week.</div>';
}
function render(){renderTasks();renderSchedule();renderGoals();save()}
$('open-task-form').addEventListener('click',()=>{$('task-form').classList.toggle('hidden');$('task-title').focus()});
$('task-form').addEventListener('submit',e=>{e.preventDefault();tasks.push({id:nextId(),title:$('task-title').value.trim(),subject:$('task-subject').value,due:$('task-due').value,done:false});$('task-form').reset();$('task-due').value=localDate(today);$('task-form').classList.add('hidden');render()});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===btn));renderTasks()}));
$('task-list').addEventListener('change',e=>{const id=Number(e.target.dataset.taskCheck);if(id){const task=tasks.find(t=>t.id===id);if(task)task.done=e.target.checked;render()}});
$('task-list').addEventListener('click',e=>{const id=Number(e.target.dataset.taskDelete);if(id){tasks=tasks.filter(t=>t.id!==id);render()}});
$('schedule-form').addEventListener('submit',e=>{e.preventDefault();schedule.push({id:nextId(),time:$('schedule-time').value,topic:$('schedule-subject').value.trim()});$('schedule-subject').value='';render()});
$('schedule-list').addEventListener('click',e=>{const id=Number(e.target.dataset.scheduleDelete);if(id){schedule=schedule.filter(s=>s.id!==id);render()}});
$('open-goal-form').addEventListener('click',()=>{$('goal-form').classList.toggle('hidden');$('goal-title').focus()});
$('goal-form').addEventListener('submit',e=>{e.preventDefault();goals.push({id:nextId(),title:$('goal-title').value.trim(),done:false});$('goal-title').value='';$('goal-form').classList.add('hidden');render()});
$('goal-list').addEventListener('change',e=>{const id=Number(e.target.dataset.goalCheck);if(id){const goal=goals.find(g=>g.id===id);if(goal)goal.done=e.target.checked;render()}});
$('goal-list').addEventListener('click',e=>{const id=Number(e.target.dataset.goalDelete);if(id){e.preventDefault();goals=goals.filter(g=>g.id!==id);render()}});
document.querySelectorAll('.nav-link').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b===btn));const view=btn.dataset.view;if(view==='tasks')$('task-section').scrollIntoView({behavior:'smooth'});else if(view==='goals')$('goals-section').scrollIntoView({behavior:'smooth'});else if(view==='schedule')document.querySelector('.schedule-panel').scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'smooth'})}));
render();
