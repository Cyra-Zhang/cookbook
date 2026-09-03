
let recipes = [];
const state = {
  mode: 'day',
  day: '全部',
  ingredient: '全部',
  search: '',
  quick: 'all',
  favorites: JSON.parse(localStorage.getItem('mealFavorites') || '[]'),
  done: JSON.parse(localStorage.getItem('mealDone') || '[]'),
  currentModalId: null,
  todayId: null
};

const WEEK_ORDER = ['全部','周一','周二','周三','周四','周五','周六','周日'];
const app = {
  grid: document.getElementById('cardGrid'),
  selectorWrap: document.getElementById('selectorWrap'),
  sectionTitle: document.getElementById('sectionTitle'),
  modal: document.getElementById('detailModal'),
  modalContent: document.getElementById('modalContent'),
  todayTitle: document.getElementById('todayTitle'),
  todayMeta: document.getElementById('todayMeta'),
  countRecipes: document.getElementById('countRecipes'),
  countIngredients: document.getElementById('countIngredients')
};

fetch('recipes.json')
  .then(r => r.json())
  .then(data => {
    recipes = data;
    initialize();
  });

function initialize(){
  state.todayId = recipes[0]?.id || null;
  updateStats();
  bindTopControls();
  bindBottomNav();
  chooseToday(state.todayId);
  renderSelector();
  renderCards();
}

function bindTopControls(){
  document.querySelectorAll('.seg-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      state.day = '全部';
      state.ingredient = '全部';
      renderSelector();
      renderCards();
      updateSectionTitle();
      setActiveNav(state.mode);
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e)=>{
    state.search = e.target.value.trim();
    renderCards();
  });

  document.querySelectorAll('.quick-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('.quick-chip').forEach(x=>x.classList.remove('active'));
      chip.classList.add('active');
      state.quick = chip.dataset.quick;
      renderCards();
      updateSectionTitle();
      if(state.quick === 'favorites') setActiveNav('favorites');
    });
  });

  document.getElementById('openTodayBtn').addEventListener('click', ()=>{
    if(state.todayId) openDetail(state.todayId);
  });

  document.getElementById('randomBtn').addEventListener('click', ()=>{
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    chooseToday(pick.id);
  });

  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('closeModalMask').addEventListener('click', closeModal);
}

function bindBottomNav(){
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const nav = btn.dataset.nav;
      if(nav === 'home'){
        window.scrollTo({top:0, behavior:'smooth'});
        setActiveNav('home');
        return;
      }
      if(nav === 'day'){
        switchMode('day');
        return;
      }
      if(nav === 'ingredient'){
        switchMode('ingredient');
        return;
      }
      if(nav === 'favorites'){
        state.quick = 'favorites';
        document.querySelectorAll('.quick-chip').forEach(x=>x.classList.toggle('active', x.dataset.quick === 'favorites'));
        renderCards();
        updateSectionTitle();
        setActiveNav('favorites');
        return;
      }
      if(nav === 'reset'){
        resetFilters();
        setActiveNav('reset');
      }
    });
  });
}

function switchMode(mode){
  state.mode = mode;
  state.day = '全部';
  state.ingredient = '全部';
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.mode === mode));
  renderSelector();
  renderCards();
  updateSectionTitle();
  setActiveNav(mode);
}

function resetFilters(){
  state.mode = 'day';
  state.day = '全部';
  state.ingredient = '全部';
  state.quick = 'all';
  state.search = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.mode === 'day'));
  document.querySelectorAll('.quick-chip').forEach(x=>x.classList.toggle('active', x.dataset.quick === 'all'));
  renderSelector();
  renderCards();
  updateSectionTitle();
}

function setActiveNav(name){
  const map = {home:'home', day:'day', ingredient:'ingredient', favorites:'favorites', reset:'reset'};
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.nav === map[name]);
  });
}

function getAllIngredients(){
  const set = new Set(['全部']);
  recipes.forEach(r => (r.filter_ingredients || []).forEach(i => set.add(i)));
  return Array.from(set);
}

function renderSelector(){
  if(state.mode === 'day'){
    app.selectorWrap.innerHTML = `
      <div class="selector-row" id="dayChips">
        ${WEEK_ORDER.map(day => `<button class="chip ${state.day===day?'active':''}" data-day="${day}">${day}</button>`).join('')}
      </div>
    `;
    document.querySelectorAll('[data-day]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.day = btn.dataset.day;
        document.querySelectorAll('[data-day]').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        renderCards();
        updateSectionTitle();
      });
    });
  } else {
    const ingredients = getAllIngredients();
    app.selectorWrap.innerHTML = `
      <div class="selector-row" id="ingredientChips">
        ${ingredients.map(ing => `<button class="chip ${state.ingredient===ing?'active':''}" data-ingredient="${ing}">${ing}</button>`).join('')}
      </div>
    `;
    document.querySelectorAll('[data-ingredient]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.ingredient = btn.dataset.ingredient;
        document.querySelectorAll('[data-ingredient]').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        renderCards();
        updateSectionTitle();
      });
    });
  }
}

function updateStats(){
  const ingSet = new Set();
  recipes.forEach(r => (r.filter_ingredients || []).forEach(i => ingSet.add(i)));
  app.countRecipes.textContent = `${recipes.length} 道菜`;
  app.countIngredients.textContent = `${ingSet.size} 种食材`;
}

function chooseToday(id){
  state.todayId = id;
  const recipe = recipes.find(r => r.id === id);
  if(!recipe) return;
  app.todayTitle.textContent = recipe.title;
  app.todayMeta.textContent = `${recipe.date} · ${recipe.meal} · ${recipe.time}`;
}

function getFilteredRecipes(){
  let list = [...recipes];

  if(state.mode === 'day' && state.day !== '全部'){
    list = list.filter(r => (r.weekday || r.date).includes(state.day));
  }

  if(state.mode === 'ingredient' && state.ingredient !== '全部'){
    list = list.filter(r => (r.filter_ingredients || []).includes(state.ingredient));
  }

  if(state.search){
    const q = state.search.toLowerCase();
    list = list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.ingredients_text.toLowerCase().includes(q) ||
      (r.filter_ingredients || []).join(' ').toLowerCase().includes(q)
    );
  }

  if(state.quick === 'meat') list = list.filter(r => r.is_meaty);
  if(state.quick === 'fast') list = list.filter(r => ['20分钟','25分钟','30分钟'].includes(r.time));
  if(state.quick === 'bowl') list = list.filter(r => r.is_rice_bowl);
  if(state.quick === 'favorites') list = list.filter(r => state.favorites.includes(r.id));

  list.sort((a,b)=> a.sort_order - b.sort_order);
  return list;
}

function updateSectionTitle(){
  let title = '全部菜谱';
  if(state.mode === 'day' && state.day !== '全部') title = `${state.day} 菜谱`;
  if(state.mode === 'ingredient' && state.ingredient !== '全部') title = `含「${state.ingredient}」的菜谱`;
  if(state.quick === 'meat') title = '今晚想吃肉';
  if(state.quick === 'fast') title = '30分钟左右完成';
  if(state.quick === 'bowl') title = '盖饭 / 焖饭 / 炒饭';
  if(state.quick === 'favorites') title = '我的收藏';
  if(state.search) title = `搜索结果：${state.search}`;
  app.sectionTitle.textContent = title;
}

function saveState(){
  localStorage.setItem('mealFavorites', JSON.stringify(state.favorites));
  localStorage.setItem('mealDone', JSON.stringify(state.done));
}

function toggleFavorite(id){
  const has = state.favorites.includes(id);
  state.favorites = has ? state.favorites.filter(x=>x!==id) : [...state.favorites, id];
  saveState();
  renderCards();
  if(state.currentModalId === id) openDetail(id);
}

function toggleDone(id){
  const has = state.done.includes(id);
  state.done = has ? state.done.filter(x=>x!==id) : [...state.done, id];
  saveState();
  renderCards();
  if(state.currentModalId === id) openDetail(id);
}

function makeCover(recipe, large=false){
  const [c1,c2,c3] = recipe.palette || ['#F8C28A','#E98B5B','#7C4A34'];
  const title = escapeXML(recipe.title);
  const subtitle = escapeXML(`${recipe.date} · ${recipe.meal} · ${recipe.time}`);
  const emojis = escapeXML(recipe.visual || '🍚✨🥗');
  const width = large ? 1400 : 1200;
  const height = large ? 900 : 700;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 700">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="55%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="30"/></filter>
    </defs>
    <rect width="1200" height="700" fill="url(#g)"/>
    <circle cx="200" cy="120" r="120" fill="rgba(255,255,255,.35)" filter="url(#blur)"/>
    <circle cx="980" cy="160" r="140" fill="rgba(255,255,255,.28)" filter="url(#blur)"/>
    <circle cx="940" cy="590" r="180" fill="rgba(255,255,255,.18)" filter="url(#blur)"/>
    <rect x="56" y="56" rx="36" ry="36" width="1088" height="588" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.36)"/>
    <text x="86" y="116" font-family="SF Pro Display, PingFang SC, sans-serif" font-size="30" fill="rgba(255,255,255,.92)">Personal Kitchen · Premium Edition</text>
    <text x="84" y="560" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif" font-size="168">${emojis}</text>
    <text x="84" y="236" font-family="SF Pro Display, PingFang SC, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${title}</text>
    <text x="86" y="288" font-family="SF Pro Display, PingFang SC, sans-serif" font-size="28" fill="rgba(255,255,255,.94)">${subtitle}</text>
    <rect x="84" y="330" rx="26" ry="26" width="270" height="64" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.34)"/>
    <text x="114" y="372" font-family="SF Pro Display, PingFang SC, sans-serif" font-size="30" fill="#ffffff">按你的表格步骤做</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXML(str=''){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&apos;');
}

function truncate(text, max=72){
  return text.length > max ? text.slice(0,max) + '…' : text;
}

function renderCards(){
  updateSectionTitle();
  const list = getFilteredRecipes();
  if(!list.length){
    app.grid.innerHTML = `
      <div class="glass empty-state">
        <h3>没有找到符合条件的菜谱</h3>
        <p>可以切换“按日期 / 按食材”、点击底部导航，或者清空筛选再试试。</p>
      </div>
    `;
    return;
  }
  app.grid.innerHTML = list.map(recipe => {
    const fav = state.favorites.includes(recipe.id);
    const done = state.done.includes(recipe.id);
    return `
      <article class="glass recipe-card">
        <img class="cover" src="${makeCover(recipe)}" alt="${recipe.title}">
        <div class="recipe-body">
          <div class="card-top">
            <div>
              <h3 class="card-title">${recipe.title}</h3>
              <div class="meta-row">
                <span class="badge">📅 ${recipe.date} · ${recipe.meal}</span>
                <span class="badge">⏱ ${recipe.time}</span>
              </div>
            </div>
          </div>
          <p class="desc">${truncate(recipe.steps_text, 92)}</p>
          <div class="ingredients-preview">
            ${(recipe.filter_ingredients || []).slice(0,5).map(i => `<span class="mini-chip">${i}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="action-button primary flex-grow" onclick="openDetail(${recipe.id})">查看详细步骤</button>
            <button class="icon-btn ${fav ? 'active':''}" onclick="event.stopPropagation();toggleFavorite(${recipe.id})">${fav ? '💛 已收藏' : '🤍 收藏'}</button>
            <button class="icon-btn ${done ? 'active':''}" onclick="event.stopPropagation();toggleDone(${recipe.id})">${done ? '✅ 已做' : '☑️ 打卡'}</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function openDetail(id){
  state.currentModalId = id;
  const recipe = recipes.find(r => r.id === id);
  if(!recipe) return;
  const fav = state.favorites.includes(id);
  const done = state.done.includes(id);
  app.modalContent.innerHTML = `
    <div class="detail-cover">
      <img src="${makeCover(recipe, true)}" alt="${recipe.title}">
    </div>
    <div class="detail-section">
      <h2 class="detail-title">${recipe.title}</h2>
      <div class="detail-meta">
        <span class="badge">📅 ${recipe.date} · ${recipe.meal}</span>
        <span class="badge">⏱ ${recipe.time}</span>
        <span class="badge">👤 一人份</span>
      </div>
      <div class="card-actions">
        <button class="action-button primary" onclick="toggleFavorite(${id})">${fav ? '已收藏' : '收藏这道菜'}</button>
        <button class="action-button ghost" onclick="toggleDone(${id})">${done ? '已做完' : '标记做完'}</button>
      </div>
    </div>

    <div class="detail-section">
      <h3>🥣 食材（严格按你的表格）</h3>
      <div class="ingredients-preview">
        ${(recipe.ingredients_list || []).map(i => `<span class="mini-chip">${i}</span>`).join('')}
      </div>
      <p class="desc">${recipe.ingredients_text}</p>
    </div>

    <div class="detail-section">
      <h3>👩‍🍳 分步骤做法</h3>
      <ol class="step-list">
        ${(recipe.steps_list || []).map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <div class="detail-section">
      <h3>📝 原始做法（和表格一致）</h3>
      <div class="original-steps">${recipe.steps_text}</div>
    </div>

    <div class="detail-section">
      <h3>🧺 备菜建议</h3>
      <div class="original-steps">${recipe.prep || '无特别备注'}</div>
    </div>
  `;
  app.modal.classList.remove('hidden');
  app.modal.setAttribute('aria-hidden', 'false');
}

function closeModal(){
  app.modal.classList.add('hidden');
  app.modal.setAttribute('aria-hidden', 'true');
}

window.openDetail = openDetail;
window.toggleFavorite = toggleFavorite;
window.toggleDone = toggleDone;
