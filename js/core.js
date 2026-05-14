// ===== UtiloHub Core — Window Manager, Dock, Notifications =====

export const UH = {
  windows: {},
  zBase: 200,
  z: 200,

  // ── Open/create a window ──
  open(id, title, icon, html, w=460, h=520, x=null, y=null) {
    if (this.windows[id]) { this.focus(id); return; }
    const desktop = document.getElementById('desktop');
    const count = Object.keys(this.windows).length;
    const posX = x ?? Math.max(60, Math.min(80 + count * 32, window.innerWidth - w - 40));
    const posY = y ?? Math.max(38, Math.min(60 + count * 28, window.innerHeight - h - 80));

    const win = document.createElement('div');
    win.className = 'window focused';
    win.id = `win-${id}`;
    win.style.cssText = `width:${w}px;height:${h}px;left:${posX}px;top:${posY}px;z-index:${++this.z}`;
    win.innerHTML = `
      <div class="window-titlebar" id="tb-${id}">
        <div class="traffic-lights">
          <button class="tl close" id="tl-close-${id}" title="閉じる"><span class="icon">✕</span></button>
          <button class="tl min"   id="tl-min-${id}"   title="最小化"><span class="icon">—</span></button>
          <button class="tl max"   id="tl-max-${id}"   title="最大化"><span class="icon">+</span></button>
        </div>
        <div class="window-title">${title}</div>
        <div style="width:45px"></div>
      </div>
      <div class="window-body" id="body-${id}">${html}</div>`;
    desktop.appendChild(win);

    // ── Button events ──
    document.getElementById(`tl-close-${id}`)?.addEventListener('click', e => { e.stopPropagation(); this.close(id); });
    document.getElementById(`tl-min-${id}`)?.addEventListener('click',   e => { e.stopPropagation(); this.minimize(id); });
    document.getElementById(`tl-max-${id}`)?.addEventListener('click',   e => { e.stopPropagation(); this.toggleMax(id); });

    win.addEventListener('mousedown', () => this.focus(id));
    this._makeDraggable(id);
    this.windows[id] = { w, h, x: posX, y: posY, max: false, hidden: false };
    this._dockDot(id, true);
    this._updateTaskbar();
    return win;
  },

  close(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.classList.add('closing');
    setTimeout(() => {
      win.remove();
      delete this.windows[id];
      this._dockDot(id, false);
      this._updateTaskbar();
    }, 180);
  },

  minimize(id) {
    const win = document.getElementById(`win-${id}`);
    const meta = this.windows[id];
    if (!win || !meta) return;
    if (meta.hidden) {
      win.style.display = 'flex';
      meta.hidden = false;
      this.focus(id);
    } else {
      win.classList.add('minimizing');
      setTimeout(() => { win.style.display = 'none'; win.classList.remove('minimizing'); }, 300);
      meta.hidden = true;
    }
    this._updateTaskbar();
  },

  toggleMax(id) {
    const win = document.getElementById(`win-${id}`);
    const m = this.windows[id]; if (!win || !m) return;
    if (m.max) {
      win.style.cssText = `width:${m.w}px;height:${m.h}px;left:${m.x}px;top:${m.y}px;z-index:${++this.z};border-radius:12px`;
      m.max = false;
    } else {
      m.sx = win.style.left; m.sy = win.style.top;
      win.style.cssText = `width:100vw;height:calc(100vh - 28px);left:0;top:28px;z-index:${++this.z};border-radius:0`;
      m.max = true;
    }
  },

  focus(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.style.zIndex = ++this.z;
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    win.classList.add('focused');
    // unfocus titlebar
    document.querySelectorAll('.window-titlebar').forEach(tb => tb.classList.add('unfocused'));
    document.getElementById(`tb-${id}`)?.classList.remove('unfocused');
  },

  _dockDot(id, show) {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) dot.style.display = show ? 'block' : 'none';
  },

  _updateTaskbar() {
    // optional mini taskbar indicators
  },

  _makeDraggable(id) {
    const tb  = document.getElementById(`tb-${id}`);
    const win = document.getElementById(`win-${id}`);
    if (!tb || !win) return;
    let dragging = false, ox = 0, oy = 0;
    const start = e => {
      if (e.target.classList.contains('tl') || e.target.classList.contains('icon')) return;
      dragging = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop;
      this.focus(id);
    };
    const move  = e => { if (!dragging) return; win.style.left = Math.max(0, e.clientX-ox)+'px'; win.style.top = Math.max(28, e.clientY-oy)+'px'; };
    const stop  = () => { dragging = false; };
    tb.addEventListener('mousedown', start);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  },

  // ── Notification ──
  notify(title, msg='', icon='🔔', color='#0071e3') {
    const el = document.createElement('div');
    el.className = 'notif';
    el.innerHTML = `<div class="notif-icon">${icon}</div><div class="notif-body"><div class="notif-title">${title}</div><div class="notif-msg">${msg}</div></div>`;
    el.style.borderLeft = `3px solid ${color}`;
    // stack
    const existing = document.querySelectorAll('.notif');
    el.style.top = (40 + existing.length * 78) + 'px';
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 3200);
  },

  // ── localStorage helpers ──
  ls: {
    get: (k, def=null) => { try { const v=localStorage.getItem('uh2_'+k); return v===null?def:JSON.parse(v); } catch { return def; } },
    set: (k, v) => { try { localStorage.setItem('uh2_'+k, JSON.stringify(v)); } catch {} },
  },
};

window.UH = UH;

// ── Spotlight (Cmd+Space) ──
window.toggleSpotlight = () => {
  const el = document.getElementById('spotlight');
  if (!el) return;
  const open = el.classList.toggle('open');
  if (open) {
    document.getElementById('spotlight-input')?.focus();
    document.getElementById('spotlight-input').value = '';
    renderSpotlightResults('');
  }
};
document.addEventListener('keydown', e => {
  if ((e.metaKey||e.ctrlKey) && e.code==='Space') { e.preventDefault(); window.toggleSpotlight(); }
  if (e.code==='Escape') { document.getElementById('spotlight')?.classList.remove('open'); }
});

window.renderSpotlightResults = q => {
  const apps = [
    {id:'notepad',   name:'メモ帳',        icon:'📝', fn:'openNotepad'},
    {id:'tasks',     name:'タスク管理',    icon:'✅', fn:'openTasks'},
    {id:'calendar',  name:'カレンダー',    icon:'📅', fn:'openCalendar'},
    {id:'music',     name:'音楽',          icon:'🎵', fn:'openMusic'},
    {id:'clock',     name:'時計',          icon:'🕐', fn:'openClock'},
    {id:'calculator',name:'電卓',          icon:'🧮', fn:'openCalculator'},
    {id:'weather',   name:'天気',          icon:'🌤', fn:'openWeather'},
    {id:'pomodoro',  name:'ポモドーロ',    icon:'🍅', fn:'openPomodoro'},
    {id:'paint',     name:'ペイント',      icon:'🎨', fn:'openPaint'},
    {id:'snake',     name:'スネーク',      icon:'🐍', fn:'openSnake'},
    {id:'terminal',  name:'ターミナル',    icon:'💻', fn:'openTerminal'},
    {id:'files',     name:'ファイル',      icon:'📁', fn:'openFiles'},
    {id:'settings',  name:'設定',          icon:'⚙️', fn:'openSettings'},
  ];
  const res = document.getElementById('spotlight-results');
  if (!res) return;
  const filtered = q ? apps.filter(a=>a.name.includes(q)||a.id.includes(q.toLowerCase())) : apps;
  res.innerHTML = filtered.map((a,i)=>`
    <div class="spotlight-item ${i===0?'focused':''}" onclick="window['${a.fn}']();toggleSpotlight()">
      <div class="spotlight-item-icon">${a.icon}</div>
      <span>${a.name}</span>
    </div>`).join('');
};
