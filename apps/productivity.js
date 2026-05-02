// ===== Tasks, Calendar, Terminal, File Manager =====

// ── Task Manager ──
export function openTasks() {
  const h = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:10px 12px;display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <input id="task-input" class="input" style="flex:1;padding:8px 12px;font-size:13px" placeholder="新しいタスクを追加... (Enterで追加)" onkeydown="if(event.key==='Enter')taskAdd()">
        <select id="task-pri" class="input" style="padding:8px;font-size:12px">
          <option value="high">🔴 高</option><option value="mid" selected>🟡 中</option><option value="low">🟢 低</option>
        </select>
        <button class="btn btn-success" style="padding:8px 14px;font-size:13px" onclick="taskAdd()">＋</button>
      </div>
      <div style="padding:8px 12px;display:flex;gap:6px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <button class="btn btn-ghost" id="tf-all"  style="padding:4px 12px;font-size:11px" onclick="taskFilter('all')">すべて</button>
        <button class="btn btn-ghost" id="tf-todo" style="padding:4px 12px;font-size:11px" onclick="taskFilter('todo')">未完了</button>
        <button class="btn btn-ghost" id="tf-done" style="padding:4px 12px;font-size:11px" onclick="taskFilter('done')">完了済み</button>
        <span id="task-count" style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.3);align-self:center"></span>
      </div>
      <div id="task-list" style="flex:1;overflow-y:auto;padding:8px"></div>
    </div>`;
  UH.createWindow('tasks','タスク管理','✅',h,400,500);

  let filter='all';
  const priColors={'high':'#f87171','mid':'#fbbf24','low':'#34d399'};
  const renderTasks = () => {
    let tasks=UH.ls.get('tasks',[]);
    const list=document.getElementById('task-list'); if(!list)return;
    const shown=tasks.filter(t=>filter==='all'?true:filter==='todo'?!t.done:t.done);
    document.getElementById('task-count').textContent=`${tasks.filter(t=>!t.done).length}件残り`;
    ['all','todo','done'].forEach(f=>{const b=document.getElementById(`tf-${f}`);if(b)b.className='btn '+(f===filter?'btn-primary':'btn-ghost');b&&(b.style.cssText='padding:4px 12px;font-size:11px');});
    list.innerHTML = shown.length===0
      ? '<div style="text-align:center;color:rgba(255,255,255,0.2);padding:40px">タスクなし 🎉</div>'
      : shown.map(t=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);transition:all 0.2s;${t.done?'opacity:0.5':''}">
          <div onclick="taskToggle(${t.id})" style="width:20px;height:20px;border-radius:50%;border:2px solid ${priColors[t.pri||'mid']};background:${t.done?priColors[t.pri||'mid']:'transparent'};cursor:pointer;flex-shrink:0;transition:all 0.2s;display:flex;align-items:center;justify-content:center">
            ${t.done?'<span style="color:#0a0a0f;font-size:11px">✓</span>':''}
          </div>
          <span style="flex:1;font-size:13px;text-decoration:${t.done?'line-through':'none'};color:${t.done?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.85)'}">${t.text}</span>
          <div style="width:6px;height:6px;border-radius:50%;background:${priColors[t.pri||'mid']}"></div>
          <button onclick="taskDel(${t.id})" style="background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:14px;padding:0">✕</button>
        </div>`).join('');
  };
  window.taskAdd=()=>{
    const inp=document.getElementById('task-input');const pri=document.getElementById('task-pri');if(!inp||!inp.value.trim())return;
    const tasks=UH.ls.get('tasks',[]);tasks.push({id:Date.now(),text:inp.value.trim(),pri:pri?.value||'mid',done:false});
    UH.ls.set('tasks',tasks);inp.value='';renderTasks();UH.notify('タスクを追加しました','✅','#10b981');
  };
  window.taskToggle=id=>{const tasks=UH.ls.get('tasks',[]);const t=tasks.find(x=>x.id===id);if(t){t.done=!t.done;UH.ls.set('tasks',tasks);}renderTasks();};
  window.taskDel=id=>{const tasks=UH.ls.get('tasks',[]).filter(x=>x.id!==id);UH.ls.set('tasks',tasks);renderTasks();};
  window.taskFilter=f=>{filter=f;renderTasks();};
  renderTasks();
}
window.openTasks = openTasks;

// ── Calendar ──
export function openCalendar() {
  let d=new Date(), sel=null;
  const evs=UH.ls.get('cal_evs',{});

  const render = () => {
    const y=d.getFullYear(),mo=d.getMonth();
    const first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
    const bod=document.getElementById('cal-body'); if(!bod)return;
    bod.innerHTML='';
    document.getElementById('cal-title').textContent=`${y}年${mo+1}月`;
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;';
    ['日','月','火','水','木','金','土'].forEach((n,i)=>{const c=document.createElement('div');c.textContent=n;c.style.cssText=`text-align:center;font-size:11px;color:${i===0?'#f87171':i===6?'#60a5fa':'rgba(255,255,255,0.4)'};padding:4px;font-weight:600`;grid.appendChild(c);});
    for(let i=0;i<first;i++){const c=document.createElement('div');grid.appendChild(c);}
    for(let i=1;i<=days;i++){
      const date=new Date(y,mo,i),key=date.toDateString();
      const isToday=key===new Date().toDateString(),isSel=sel?.toDateString()===key,hasEv=(evs[key]||[]).length>0;
      const c=document.createElement('div');
      c.style.cssText=`text-align:center;padding:6px 2px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:${isToday?700:400};position:relative;transition:all 0.15s;background:${isSel?'rgba(99,102,241,0.4)':isToday?'rgba(99,102,241,0.15)':'transparent'};color:${isToday?'#a78bfa':i%7===1&&first<=i?'#f87171':'rgba(255,255,255,0.8)'}`;
      c.textContent=i;
      if(hasEv){const dot=document.createElement('div');dot.style.cssText='width:4px;height:4px;border-radius:50%;background:#34d399;position:absolute;bottom:1px;left:50%;transform:translateX(-50%)';c.appendChild(dot);}
      c.onclick=()=>{sel=date;render();renderEvents();};
      grid.appendChild(c);
    }
    bod.appendChild(grid);
    if(sel)renderEvents();
  };

  const renderEvents=()=>{
    const panel=document.getElementById('cal-events'); if(!panel)return;
    const key=sel?.toDateString();
    const list=(evs[key]||[]);
    panel.innerHTML=`
      <div style="padding:12px">
        <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:8px">${sel?sel.toLocaleDateString('ja-JP',{month:'long',day:'numeric',weekday:'short'}):'日付を選択'}</div>
        ${list.map((e,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.25);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:12px;color:white">📌 ${e}<button onclick="calDelEv('${key}',${i})" style="background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer">✕</button></div>`).join('')}
        ${sel?`<div style="display:flex;gap:6px;margin-top:8px"><input id="cal-ev-input" class="input" style="flex:1;padding:6px 10px;font-size:12px" placeholder="予定を追加..." onkeydown="if(event.key==='Enter')calAddEv()"><button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="calAddEv()">＋</button></div>`:''}
      </div>`;
  };

  const html=`
    <div style="display:flex;height:100%">
      <div style="flex:1;display:flex;flex-direction:column;padding:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <button class="btn btn-ghost" style="padding:6px 12px" onclick="calPrev()">◀</button>
          <span id="cal-title" style="font-weight:700;color:white;font-size:15px"></span>
          <button class="btn btn-ghost" style="padding:6px 12px" onclick="calNext()">▶</button>
        </div>
        <div id="cal-body" style="flex:1"></div>
      </div>
      <div id="cal-events" style="width:220px;border-left:1px solid rgba(255,255,255,0.06);overflow-y:auto"></div>
    </div>`;
  UH.createWindow('calendar','カレンダー','📅',html,560,460);

  window.calPrev=()=>{d=new Date(d.getFullYear(),d.getMonth()-1,1);render();};
  window.calNext=()=>{d=new Date(d.getFullYear(),d.getMonth()+1,1);render();};
  window.calAddEv=()=>{
    const inp=document.getElementById('cal-ev-input');if(!inp||!inp.value.trim()||!sel)return;
    const key=sel.toDateString();evs[key]=[...(evs[key]||[]),inp.value.trim()];UH.ls.set('cal_evs',evs);inp.value='';render();
  };
  window.calDelEv=(key,i)=>{evs[key]=(evs[key]||[]).filter((_,j)=>j!==i);UH.ls.set('cal_evs',evs);render();};
  setTimeout(()=>render(),50);
}
window.openCalendar = openCalendar;

// ── Terminal ──
export function openTerminal() {
  const h = `
    <div style="display:flex;flex-direction:column;height:100%;background:#0a0a0f;font-family:'JetBrains Mono',monospace">
      <div id="term-output" style="flex:1;overflow-y:auto;padding:12px;font-size:12px;line-height:1.7"></div>
      <div style="display:flex;align-items:center;padding:8px 12px;border-top:1px solid rgba(255,255,255,0.06)">
        <span style="color:#34d399;font-size:12px;margin-right:8px">utilohub $</span>
        <input id="term-input" style="flex:1;background:none;border:none;outline:none;color:#34d399;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="コマンドを入力..." onkeydown="termKey(event)">
      </div>
    </div>`;
  UH.createWindow('terminal','ターミナル','💻',h,500,380);

  const cmds={
    help:()=>['使えるコマンド:','  help, clear, date, echo [text], calc [expr]','  ls, cat notes, whoami, neofetch, weather [city]','  joke, coin, dice, color'].join('\n'),
    clear:()=>'__CLEAR__',
    date:()=>new Date().toLocaleString('ja-JP'),
    whoami:()=>'guest@utilohub',
    ls:()=>'📁 apps/  📁 notes/  📁 music/  📄 README.md',
    'cat notes':()=>{ const ns=UH.ls.get('notes',[]); return ns.map(n=>`📄 ${n.title}: ${(n.body||'').substring(0,50)}...`).join('\n')||'ノートなし'; },
    neofetch:()=>`
  ██╗   ██╗██╗  ██╗    OS: UtiloHub 2.0
  ██║   ██║██║  ██║    Browser: ${navigator.appName}
  ██║   ██║███████║    Screen: ${screen.width}x${screen.height}
  ██║   ██║██╔══██║    Lang: ${navigator.language}
  ╚██████╔╝██║  ██║    Theme: Dark
   ╚═════╝ ╚═╝  ╚═╝`,
    joke:()=>['なぜプログラマーは眼鏡をかけるの？— C# だから','バグって何？— 予定外の機能のこと！','デバッグとは？— 自分が書いたコードを読むこと'][Math.floor(Math.random()*3)],
    coin:()=>Math.random()>0.5?'🪙 表 (HEAD)':'🔵 裏 (TAIL)',
    dice:()=>`🎲 ${Math.floor(Math.random()*6)+1}`,
    color:()=>{const c='#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');return `<span style="color:${c}">■■■</span> ${c}`;},
  };

  let history=[], histIdx=0;
  const print=(text,cls='terminal-output')=>{
    const out=document.getElementById('term-output');if(!out)return;
    if(text==='__CLEAR__'){out.innerHTML='';return;}
    const line=document.createElement('div');
    line.className='terminal-line '+cls;
    line.innerHTML=text.replace(/\n/g,'<br>');
    out.appendChild(line);out.scrollTop=out.scrollHeight;
  };

  print('<span style="color:#a78bfa">UtiloHub Terminal v2.0</span> — "help" でコマンド一覧');

  window.termKey=e=>{
    const inp=document.getElementById('term-input');if(!inp)return;
    if(e.key==='Enter'){
      const raw=inp.value.trim();if(!raw)return;
      history.unshift(raw);histIdx=0;
      print(`<span class="terminal-prompt">$ </span>${raw}`);
      const parts=raw.split(' ');const cmd=parts[0];
      if(cmd==='echo') print(parts.slice(1).join(' '));
      else if(cmd==='calc') { try{print(String(eval(parts.slice(1).join(' '))));}catch{print('計算エラー','terminal-error');} }
      else if(cmd==='weather') window.fetchWeather?.();
      else if(cmds[raw]) print(cmds[raw]());
      else if(cmds[cmd]) print(cmds[cmd]());
      else print(`コマンドが見つかりません: ${cmd}。"help" で一覧を確認してください`,'terminal-error');
      inp.value='';
    } else if(e.key==='ArrowUp') { if(histIdx<history.length){inp.value=history[histIdx++];} }
    else if(e.key==='ArrowDown') { histIdx=Math.max(0,histIdx-1);inp.value=history[histIdx]||''; }
  };
  setTimeout(()=>document.getElementById('term-input')?.focus(),100);
}
window.openTerminal = openTerminal;

// ── File Manager ──
export function openFiles() {
  const files=[
    {name:'README.md',icon:'📄',size:'2 KB',date:'2025-01-01'},
    {name:'notes/',icon:'📁',size:'—',date:'2025-01-01'},
    {name:'music/',icon:'📁',size:'—',date:'2025-01-01'},
    {name:'screenshots/',icon:'📁',size:'—',date:'2025-01-01'},
  ];
  const notes=UH.ls.get('notes',[]);
  const allFiles=[...files,...notes.map(n=>({name:n.title+'.txt',icon:'📝',size:`${(n.body||'').length} B`,date:new Date().toISOString().split('T')[0]}))];

  const h=`
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <span style="font-size:12px;color:rgba(255,255,255,0.4)">📁 ~/UtiloHub</span>
        <div style="flex:1"></div>
        <input class="input" style="width:160px;padding:5px 10px;font-size:12px" placeholder="🔍 検索..." oninput="fileSearch(this.value)">
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:10px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px">
        <span>名前</span><span>更新日</span><span>サイズ</span>
      </div>
      <div id="file-list" style="flex:1;overflow-y:auto;padding:6px 4px"></div>
    </div>`;
  UH.createWindow('files','ファイル','📁',h,420,380);

  const render=(list=allFiles)=>{
    const el=document.getElementById('file-list');if(!el)return;
    el.innerHTML=list.map(f=>`
      <div class="file-item" style="display:grid;grid-template-columns:repeat(3,1fr)">
        <span><span style="margin-right:8px">${f.icon}</span>${f.name}</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.4)">${f.date}</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.4)">${f.size}</span>
      </div>`).join('');
  };
  window.fileSearch=q=>render(allFiles.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())));
  setTimeout(()=>render(),50);
}
window.openFiles = openFiles;
