/* ---------- Simple Pro Test Platform (no backend) ----------
   - Auth (localStorage)
   - Themes and backgrounds
   - Requires login to start (can use guest)
   - Timer per test
   - Leaderboard in localStorage
   - Questions loaded from questions.json
----------------------------------------------------------- */

const DOM = {
  userbox: document.getElementById('userbox'),
  theme: document.getElementById('theme'),
  bg: document.getElementById('bg'),
  profileBtn: document.getElementById('profile-btn'),
  leaderboardBtn: document.getElementById('leaderboard-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  content: document.getElementById('content'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  openRegister: document.getElementById('open-register'),
  openLogin: document.getElementById('open-login'),
  guestBtn: document.getElementById('guest-btn'),
  timer: document.getElementById('timer'),
  qcount: document.getElementById('qcount'),
};

let currentUser = null;
let questions = [];
let currentQuestion = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 0; // seconds
const TEST_TIME = 60 * 5; // default 5 minutes for whole test

/* ---------- UTIL ---------- */
const storage = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){return null} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};

function showModal(html){ DOM.modal.classList.remove('hidden'); DOM.modalBody.innerHTML = html; DOM.modal.setAttribute('aria-hidden','false'); }
function closeModal(){ DOM.modal.classList.add('hidden'); DOM.modalBody.innerHTML = ''; DOM.modal.setAttribute('aria-hidden','true'); clearIntervals(); }
DOM.modalClose.addEventListener('click', closeModal);
DOM.modal.addEventListener('click', (e)=>{ if(e.target===DOM.modal) closeModal(); });

function clearIntervals(){ if(timerInterval){ clearInterval(timerInterval); timerInterval = null; } }

/* ---------- AUTH ---------- */
function renderUserbox(){
  const users = storage.get('test_users') || {};
  currentUser = storage.get('test_current') || null;

  if(currentUser){
    DOM.userbox.innerHTML = `
      <img src="${currentUser.avatar || 'https://api.dicebear.com/6.x/identicon/svg?seed='+encodeURIComponent(currentUser.name)}" alt="avatar" />
      <div class="user-meta">
        <div class="name">${currentUser.name}</div>
        <div class="muted">${currentUser.email || '—'}</div>
      </div>
    `;
    DOM.logoutBtn.classList.remove('hidden');
  } else {
    DOM.userbox.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="font-weight:600">Xush kelibsiz</div>
        <div style="color:var(--muted);font-size:13px">Ro'yxatdan o'ting yoki tizimga kiring</div>
      </div>
    `;
    DOM.logoutBtn.classList.add('hidden');
  }
}

/* Register form */
DOM.openRegister.addEventListener('click', ()=>{
  showModal(`
    <h3>Ro'yxatdan o'tish</h3>
    <p class="muted">Profil ma'lumotlari mahalliy xotirada saqlanadi (localStorage)</p>
    <div style="display:grid;gap:8px;margin-top:8px">
      <input id="r_name" placeholder="Ism (public)" />
      <input id="r_email" placeholder="Email (optional)" />
      <input id="r_pass" placeholder="Parol" type="password" />
      <input id="r_avatar" placeholder="Avatar (image URL, optional)" />
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button class="btn outline" id="r_cancel">Bekor</button>
        <button class="btn" id="r_submit">Ro'yxatdan o'tish</button>
      </div>
    </div>
  `);

  document.getElementById('r_cancel').addEventListener('click', closeModal);
  document.getElementById('r_submit').addEventListener('click', ()=>{
    const name = document.getElementById('r_name').value.trim();
    const email = document.getElementById('r_email').value.trim();
    const pass = document.getElementById('r_pass').value;
    const avatar = document.getElementById('r_avatar').value.trim();

    if(!name || !pass){ alert('Ism va parol kiritish shart'); return; }

    const users = storage.get('test_users') || {};
    if(users[email || name]){ alert('Bu email yoki foydalanuvchi mavjud'); return; }

    const user = { id: Date.now(), name, email, pass, avatar };
    users[email || name] = user;
    storage.set('test_users', users);
    storage.set('test_current', user);
    renderUserbox();
    closeModal();
    renderWelcome();
    alert('Ro\'yxatdan o\'tildi ✅');
  });
});

/* Login */
DOM.openLogin.addEventListener('click', ()=>{
  showModal(`
    <h3>Tizimga kirish</h3>
    <div style="display:grid;gap:8px;margin-top:8px">
      <input id="l_id" placeholder="Email yoki ism" />
      <input id="l_pass" placeholder="Parol" type="password" />
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button class="btn outline" id="l_cancel">Bekor</button>
        <button class="btn" id="l_submit">Kirish</button>
      </div>
    </div>
  `);
  document.getElementById('l_cancel').addEventListener('click', closeModal);
  document.getElementById('l_submit').addEventListener('click', ()=>{
    const id = document.getElementById('l_id').value.trim();
    const pass = document.getElementById('l_pass').value;
    const users = storage.get('test_users') || {};
    const user = users[id] || Object.values(users).find(u => u.email === id);
    if(!user || user.pass !== pass){ alert('Noto‘g‘ri login yoki parol'); return; }
    storage.set('test_current', user);
    renderUserbox();
    closeModal();
    renderWelcome();
  });
});

DOM.logoutBtn.addEventListener('click', ()=>{
  storage.set('test_current', null);
  renderUserbox();
  renderWelcome();
});

/* Profile button */
DOM.profileBtn.addEventListener('click', ()=>{
  const u = storage.get('test_current');
  if(!u){ alert('Avval tizimga kiring'); return; }
  showModal(`
    <h3>Profil: ${u.name}</h3>
    <div style="display:grid;gap:8px;margin-top:8px">
      <div><strong>Email:</strong> ${u.email || '—'}</div>
      <div><strong>ID:</strong> ${u.id}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button class="btn outline" id="closeprof">Yopish</button>
      </div>
    </div>
  `);
  document.getElementById('closeprof').addEventListener('click', closeModal);
});

/* Leaderboard */
DOM.leaderboardBtn.addEventListener('click', showLeaderboard);
function showLeaderboard(){
  const lb = storage.get('test_leaderboard') || [];
  const rows = lb.sort((a,b)=>b.score - a.score).slice(0,20).map(r => 
    `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.04)">
      <div><strong>${escapeHtml(r.name)}</strong> <small style="color:var(--muted)">(${r.user || 'guest'})</small></div>
      <div>${r.score}/${r.total} · ${r.percent}%</div>
    </div>`).join('');
  showModal(`<h3>Leaderboard</h3><div style="max-height:360px;overflow:auto;margin-top:10px">${rows || '<em>Hozircha natija yo‘q</em>'}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px">
      <button class="btn outline" id="closelb">Yopish</button>
    </div>`);
  document.getElementById('closelb').addEventListener('click', closeModal);
}

/* Escape helper */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

/* ---------- THEMES & BG ---------- */
DOM.theme.addEventListener('change', (e)=>{
  document.body.classList.remove('theme-dark','theme-gradient');
  if(e.target.value === 'dark') document.body.classList.add('theme-dark');
  if(e.target.value === 'gradient') document.body.classList.add('theme-gradient');
  storage.set('test_theme', e.target.value);
});
DOM.bg.addEventListener('change', (e)=>{
  document.body.classList.remove('bg-dots','bg-waves');
  if(e.target.value === 'dots') document.body.classList.add('bg-dots');
  if(e.target.value === 'waves') document.body.classList.add('bg-waves');
  storage.set('test_bg', e.target.value);
});

/* ---------- LOAD QUESTIONS ---------- */
async function loadQuestions(){
  try {
    const res = await fetch('questions.json');
    const data = await res.json();
    return data;
  } catch(e){
    console.error('questions load error',e);
    return [];
  }
}

/* ---------- RENDER WELCOME ---------- */
function renderWelcome(){
  DOM.content.innerHTML = '';
  const u = storage.get('test_current');
  const el = document.createElement('div');
  el.className = 'card center';
  el.innerHTML = `
    <h2>${u ? 'Assalomu alaykum, ' + escapeHtml(u.name) : 'Salom!'} 👋</h2>
    <p class="muted">${u ? 'Testni boshlash uchun quyidagi tugmani bosing.' : 'Login yoki register orqali natijalarni saqlab qolasiz.'}</p>
    <div class="actions">
      <button id="start-test" class="btn">🚀 Testni boshlash</button>
      <button id="manage-btn" class="btn outline">Savollarni ko‘rish / Import</button>
    </div>
  `;
  DOM.content.appendChild(el);

  document.getElementById('start-test').addEventListener('click', ()=>{
    const cur = storage.get('test_current');
    if(!cur){
      const ok = confirm('Siz mehmon sifatida davom etmoqchisizmi? (Natijalar mehmon sifatida saqlanadi)'); 
      if(!ok) return;
    }
    startQuizFlow();
  });

  document.getElementById('manage-btn').addEventListener('click', openQuestionManager);
}

/* ---------- QUESTION MANAGER (simple) ---------- */
function openQuestionManager(){
  const qLocal = storage.get('test_questions');
  const content = qLocal ? JSON.stringify(qLocal,null,2) : '';
  showModal(`
    <h3>Savollar manageri</h3>
    <p class="muted">Bu yerga JSON ko‘rinishida savollarni joylashtirib "Import" qilishingiz mumkin. Format: [ {question, options:[], correct:index, timeSec(optional)} ]</p>
    <textarea id="q_text" style="width:100%;height:200px;border-radius:8px;padding:10px">${content}</textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn outline" id="q_cancel">Bekor</button>
      <button class="btn" id="q_import">Import</button>
    </div>
  `);
  document.getElementById('q_cancel').addEventListener('click', closeModal);
  document.getElementById('q_import').addEventListener('click', ()=>{
    const val = document.getElementById('q_text').value.trim();
    if(!val) { alert('Matn bo\'sh'); return; }
    try {
      const parsed = JSON.parse(val);
      if(!Array.isArray(parsed)) throw new Error('Array kutilmoqda');
      storage.set('test_questions', parsed);
      alert('Savollar saqlandi lokalga ✅');
      closeModal();
    } catch(e){
      alert('JSON xato: '+e.message);
    }
  });
}

/* ---------- QUIZ FLOW ---------- */

async function startQuizFlow(){
  // prepare questions: load from localStorage override, else from questions.json
  const local = storage.get('test_questions');
  questions = local && local.length ? local : await loadQuestions();
  if(!questions || !questions.length){ alert('Savollar topilmadi'); return; }

  currentQuestion = 0; score = 0;
  timeLeft = questions.reduce((s,q)=> s + (q.timeSec || 30), 0); // sum of times or default 30s each
  renderQuiz();
  startTimer();
}

function renderQuiz(){
  const q = questions[currentQuestion];
  const wrap = document.createElement('div');
  wrap.className = 'card quiz-wrap';
  const total = questions.length;
  DOM.qcount.textContent = `${currentQuestion+1}/${total}`;

  wrap.innerHTML = `
    <div class="q-head">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:14px;color:var(--muted)">${q.category || ''}</div>
        <div style="font-weight:600">${escapeHtml(q.title || q.question)}</div>
      </div>
      <div style="min-width:160px">
        <div class="progress"><span id="progress-el" style="width:${Math.round((currentQuestion/total)*100)}%"></span></div>
      </div>
    </div>

    <div style="display:flex;gap:12px;align-items:center;margin-top:10px">
      <div style="flex:1">
        <div class="options" id="opts"></div>
      </div>
      <div style="width:140px;text-align:center">
        <div style="font-size:13px;color:var(--muted)">Savol vaqti</div>
        <div id="q_timer" style="font-weight:700;font-size:22px;margin-top:6px">--:--</div>
        <button id="skip-btn" class="btn outline" style="margin-top:12px">Oʻtkazib yuborish</button>
      </div>
    </div>
  `;

  DOM.content.innerHTML = '';
  DOM.content.appendChild(wrap);

  // render options
  const optsEl = document.getElementById('opts');
  q.options.forEach((opt, i) => {
    const d = document.createElement('div');
    d.className = 'option';
    d.innerHTML = `<div>${escapeHtml(opt)}</div>`;
    d.addEventListener('click', ()=> handleAnswer(i, d));
    optsEl.appendChild(d);
  });

  // question-specific timer
  const qTime = q.timeSec || 30;
  startQuestionTimer(qTime);
  document.getElementById('skip-btn').addEventListener('click', ()=> {
    // treat as wrong and move on
    handleAnswer(null, null);
  });
}

let qTimerInt = null;
function startQuestionTimer(seconds){
  clearQTimer();
  let s = seconds;
  updateQTimerDisplay(s);
  qTimerInt = setInterval(()=> {
    s--;
    updateQTimerDisplay(s);
    if(s<=0){ clearQTimer(); handleAnswer(null, null); }
  }, 1000);
}
function clearQTimer(){ if(qTimerInt){ clearInterval(qTimerInt); qTimerInt = null; } }
function updateQTimerDisplay(s){
  const el = document.getElementById('q_timer');
  if(!el) return;
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  el.textContent = `${mm}:${ss}`;
}

/* Global test timer */
function startTimer(){
  clearIntervals();
  const display = DOM.timer;
  updateGlobalTimer();
  timerInterval = setInterval(()=> {
    timeLeft--;
    updateGlobalTimer();
    if(timeLeft <= 0) { clearIntervals(); finishTest(); }
  }, 1000);
}
function updateGlobalTimer(){
  const mm = String(Math.floor(timeLeft/60)).padStart(2,'0');
  const ss = String(timeLeft%60).padStart(2,'0');
  DOM.timer.textContent = `⏱ ${mm}:${ss}`;
}

/* Answer handling */
function handleAnswer(index, domEl){
  clearQTimer();
  const q = questions[currentQuestion];
  const options = document.querySelectorAll('.option');
  // mark correct/wrong
  options.forEach((op, i)=> {
    op.style.pointerEvents = 'none';
    if(i === q.correct) op.classList.add('correct');
    if(index === i && index !== q.correct) op.classList.add('wrong');
  });
  if(index === q.correct) score++;
  // small delay then next
  setTimeout(()=>{
    currentQuestion++;
    if(currentQuestion >= questions.length) finishTest();
    else renderQuiz();
  }, 700);
}

/* Finish test */
function finishTest(){
  clearIntervals();
  clearQTimer();
  const total = questions.length;
  const percent = Math.round((score/total)*100);
  const user = storage.get('test_current');
  // save leaderboard
  const lb = storage.get('test_leaderboard') || [];
  lb.push({ name: user ? user.name : 'guest', user: user ? user.id : 'guest', score, total, percent, at: Date.now() });
  storage.set('test_leaderboard', lb);

  DOM.content.innerHTML = `
    <div class="card center">
      <h2>✅ Test yakunlandi</h2>
      <p class="muted">Siz ${total} savoldan <strong>${score}</strong> tasiga toʻgʻri javob berdingiz.</p>
      <p>Natija: <strong>${percent}%</strong></p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button id="try-again" class="btn">🔁 Qayta</button>
        <button id="view-lb" class="btn outline">Leaderboard</button>
      </div>
    </div>
  `;
  document.getElementById('try-again').addEventListener('click', ()=>{
    startQuizFlow();
  });
  document.getElementById('view-lb').addEventListener('click', showLeaderboard);
}

/* ---------- INIT ---------- */
function init(){
  // load theme & bg
  const th = storage.get('test_theme') || 'light';
  const bg = storage.get('test_bg') || 'plain';
  DOM.theme.value = th; DOM.bg.value = bg;
  if(th==='dark') document.body.classList.add('theme-dark');
  if(th==='gradient') document.body.classList.add('theme-gradient');
  if(bg==='dots') document.body.classList.add('bg-dots');
  if(bg==='waves') document.body.classList.add('bg-waves');

  // render user and welcome
  renderUserbox();
  renderWelcome();
}

init();
