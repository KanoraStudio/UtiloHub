// ===== UtiloHub Core - Window Manager, Notifications, Utils =====

export const UH = {
  windows: {},
  zCounter: 100,
  activeWindow: null,

  // Create a window
  createWindow(id, title, icon, content, w=400, h=500, x=null, y=null) {
    if (this.windows[id]) { this.focusWindow(id); return; }
    const desktop = document.getElementById('desktop');
    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${id}`;
    win.style.width  = w + 'px';
    win.style.height = h + 'px';
    win.style.left   = (x ?? (80 + Object.keys(this.windows).length * 28)) + 'px';
    win.style.top    = (y ?? (56 + Object.keys(this.windows).length * 28)) + 'px';
    win.style.zIndex = ++this.zCounter;

    win.innerHTML = `
      <div class="window-titlebar" id="tb-${id}">
        <button class="window-btn close"  onclick="UH.closeWindow('${id}')"></button>
        <button class="window-btn min"    onclick="UH.minimizeWindow('${id}')"></button>
        <button class="window-btn max"    onclick="UH.toggleMaxWindow('${id}')"></button>
        <span class="window-title">${icon} ${title}</span>
      </div>
      <div class="window-body" id="body-${id}">${content}</div>
    `;

    desktop.appendChild(win);
    this.windows[id] = { el: win, w, h, x: win.style.left, y: win.style.top, maximized: false };
    this.makeDraggable(id);
    this.focusWindow(id);
    // update dock dot
    const dot = document.getElementById(`dot-${id}`);
    if (dot) dot.style.display = 'block';
  },

  closeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.classList.add('closing');
    setTimeout(() => {
      win.remove();
      delete this.windows[id];
      const dot = document.getElementById(`dot-${id}`);
      if (dot) dot.style.display = 'none';
    }, 200);
  },

  focusWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.style.zIndex = ++this.zCounter;
    this.activeWindow = id;
  },

  minimizeWindow(id) {
    const win = document.getElementById(`win-${id}`);
    if (!win) return;
    win.style.display = win.style.display === 'none' ? 'flex' : 'none';
  },

  toggleMaxWindow(id) {
    const w = this.windows[id]; if (!w) return;
    const win = document.getElementById(`win-${id}`);
    if (w.maximized) {
      win.style.width=w.w+'px'; win.style.height=w.h+'px'; win.style.left=w.x; win.style.top=w.y; win.style.borderRadius='16px';
      w.maximized = false;
    } else {
      w.x=win.style.left; w.y=win.style.top;
      win.style.width='100vw'; win.style.height='calc(100vh - 44px)';
      win.style.left='0'; win.style.top='44px'; win.style.borderRadius='0';
      w.maximized = true;
    }
  },

  makeDraggable(id) {
    const tb = document.getElementById(`tb-${id}`);
    const win = document.getElementById(`win-${id}`);
    if (!tb || !win) return;
    let ox=0, oy=0, dragging=false;
    tb.addEventListener('mousedown', e => {
      if (e.target.classList.contains('window-btn')) return;
      dragging=true; ox=e.clientX-win.offsetLeft; oy=e.clientY-win.offsetTop;
      this.focusWindow(id);
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      win.style.left = Math.max(0, e.clientX-ox) + 'px';
      win.style.top  = Math.max(44, e.clientY-oy) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging=false; });
  },

  // Notifications
  notify(msg, icon='🔔', color='#6366f1') {
    const el = document.createElement('div');
    el.className = 'notification';
    el.innerHTML = `<span style="font-size:18px">${icon}</span> <span style="margin-left:8px">${msg}</span>`;
    el.style.borderLeft = `3px solid ${color}`;
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(), 200); }, 2800);
  },

  // LS helpers
  ls: {
    get: (k, def=null) => { try { return JSON.parse(localStorage.getItem('uh_'+k)) ?? def; } catch { return def; } },
    set: (k, v) => localStorage.setItem('uh_'+k, JSON.stringify(v)),
  }
};
window.UH = UH;
