// ===== Tasks, Calendar, Terminal, Notepad, Music =====

// ── Notepad ──
window.openNotepad = () => {
  let notes=UH.ls.get('notes2',[{id:1,title:'ようこそ',body:'UtiloHub へようこそ！\nここにメモを書けます。'}]);
  let active=notes[0]?.id||1;

  const html=`
    <div style="display:flex;height:100%;background:#1c1c1e">
      <div style="width:190px;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column">
        <div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <button class="app-btn btn-blue" style="width:100%;padding:7px;font-size:12px;border-radius:8px" onclick="ndNew()">＋ 新規</button>
        </div>
        <div id="nd-list" style="flex:1;overflow-y:auto;padding:6px"></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <input id="nd-title" class="app-input" style="flex:1;padding:6px 10px;font-size:14px;font-weight:600" placeholder="タイトル" oninput="ndSaveTitle(this.value)">
          <button class="app-btn btn-ghost" style="padding:5px 12px;font-size:12px;border-radius:8px" onclick="ndDelete()">🗑</button>
        </div>
        <textarea id="nd-body" class="app-input" style="flex:1;padding:16px;font-size:14px;line-height:1.9;resize:none;border:none;border-radius:0;background:transparent;outline:none" placeholder="ここに書く..." oninput="ndSaveBody(this.value)"></textarea>
        <div id="nd-stat" style="padding:5px 14px;font-size:11px;color:rgba(255,255,255,0.25);border-top:1px solid rgba(255,255,255,0.04)"></div>
      </div>
    </div>`;
  UH.open('notepad','メモ帳','📝',html,620,500);

  const renderList=()=>{
    const el=document.getElementById('nd-list');if(!el)return;
    el.innerHTML=notes.map(n=>`
      <div onclick="ndSelect(${n.id})" style="padding:8px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;background:${n.id===active?'rgba(0,122,255,0.2)':'transparent'};transition:background 0.1s" onmouseover="if(${n.id}!==window._ndActive)this.style.background='rgba(255,255,255,0.05)'" onmouseout="if(${n.id}!==window._ndActive)this.style.background='transparent'">
        <div style="font-size:13px;font-weight:500;color:rgba(255,255,255,${n.id===active?'0.95':'0.7'});overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.title||'無題'}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(n.body||'').substring(0,30)||'空'}</div>
      </div>`).join('');
  };
  const renderEditor=()=>{
    const n=notes.find(x=>x.id===active);if(!n)return;
    const t=document.getElementById('nd-title'),b=document.getElementById('nd-body');
    if(t)t.value=n.title||'';if(b)b.value=n.body||'';
    const s=document.getElementById('nd-stat');if(s&&b)s.textContent=`${(b.value||'').length} 文字 · ${(b.value||'').split('\n').length} 行`;
  };
  window._ndActive=active;
  window.ndSelect=id=>{active=id;window._ndActive=id;renderList();renderEditor();};
  window.ndNew=()=>{const id=Date.now();notes.push({id,title:'無題',body:''});UH.ls.set('notes2',notes);active=id;window._ndActive=id;renderList();renderEditor();};
  window.ndDelete=()=>{if(notes.length<=1){UH.notify('最後のノートは削除できません','','⚠️','#ff9f0a');return;}notes=notes.filter(n=>n.id!==active);UH.ls.set('notes2',notes);active=notes[0].id;window._ndActive=active;renderList();renderEditor();};
  window.ndSaveTitle=v=>{const n=notes.find(x=>x.id===active);if(n){n.title=v;UH.ls.set('notes2',notes);renderList();}};
  window.ndSaveBody=v=>{const n=notes.find(x=>x.id===active);if(n){n.body=v;UH.ls.set('notes2',notes);}const s=document.getElementById('nd-stat');if(s)s.textContent=`${v.length} 文字 · ${v.split('\n').length} 行`;};
  setTimeout(()=>{renderList();renderEditor();},50);
};

// ── Tasks ──
window.openTasks = () => {
  let filter='all';
  const pc={'high':'#ff453a','mid':'#ff9f0a','low':'#30d158'};
  const html=`
    <div style="display:flex;flex-direction:column;height:100%;background:#1c1c1e">
      <div style="padding:10px 12px;display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <input id="tk-inp" class="app-input" style="flex:1;padding:8px 12px;font-size:14px" placeholder="タスクを追加... (Enter)" onkeydown="if(event.key==='Enter')tkAdd()">
        <select id="tk-pri" class="app-input" style="padding:8px;font-size:12px">
          <option value="high">🔴</option><option value="mid" selected>🟡</option><option value="low">🟢</option>
        </select>
        <button class="app-btn btn-green" style="padding:8px 16px;font-size:14px;border-radius:8px" onclick="tkAdd()">＋</button>
      </div>
      <div style="padding:6px 12px;display:flex;gap:6px;border-bottom:1px solid rgba(255,255,255,0.06)">
        ${['all','todo','done'].map((f,i)=>`<button id="tkf-${f}" onclick="tkFilter('${f}')" class="app-btn ${f==='all'?'btn-blue':'btn-ghost'}" style="padding:4px 14px;font-size:12px;border-radius:16px">${['すべて','未完了','完了'][i]}</button>`).join('')}
        <span id="tk-cnt" style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.3);align-self:center"></span>
      </div>
      <div id="tk-list" style="flex:1;overflow-y:auto;padding:8px"></div>
    </div>`;
  UH.open('tasks','タスク管理','✅',html,400,500);

  const render=()=>{
    let tasks=UH.ls.get('tasks',[]);
    const el=document.getElementById('tk-list');if(!el)return;
    const shown=tasks.filter(t=>filter==='all'?true:filter==='todo'?!t.done:t.done);
    const cnt=document.getElementById('tk-cnt');if(cnt)cnt.textContent=`${tasks.filter(t=>!t.done).length}件残り`;
    ['all','todo','done'].forEach(f=>{const b=document.getElementById('tkf-'+f);if(b){b.className='app-btn '+(f===filter?'btn-blue':'btn-ghost');b.style.cssText='padding:4px 14px;font-size:12px;border-radius:16px';}});
    el.innerHTML=shown.length===0?'<div style="text-align:center;color:rgba(255,255,255,0.2);padding:40px;font-size:14px">🎉 完了！</div>':
      shown.map(t=>`
      <div style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;margin-bottom:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.05);${t.done?'opacity:0.5':''}">
        <div onclick="tkToggle(${t.id})" style="width:22px;height:22px;border-radius:50%;border:2px solid ${pc[t.pri||'mid']};background:${t.done?pc[t.pri||'mid']:'transparent'};cursor:pointer;flex-shrink:0;transition:all 0.2s;display:flex;align-items:center;justify-content:center">
          ${t.done?'<span style="color:#000;font-size:11px;font-weight:900">✓</span>':''}
        </div>
        <span style="flex:1;font-size:14px;text-decoration:${t.done?'line-through':'none'};color:${t.done?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.9)'}">${t.text}</span>
        <button onclick="tkDel(${t.id})" style="background:none;border:none;color:rgba(255,100,100,0.5);cursor:pointer;font-size:16px;padding:0;transition:color 0.1s" onmouseover="this.style.color='#ff453a'" onmouseout="this.style.color='rgba(255,100,100,0.5)'">✕</button>
      </div>`).join('');
  };
  window.tkAdd=()=>{const i=document.getElementById('tk-inp'),p=document.getElementById('tk-pri');if(!i?.value.trim())return;const tasks=UH.ls.get('tasks',[]);tasks.push({id:Date.now(),text:i.value.trim(),pri:p?.value||'mid',done:false});UH.ls.set('tasks',tasks);i.value='';render();UH.notify('タスク追加',''+i.value.trim().substring(0,30),'✅','#30d158');};
  window.tkToggle=id=>{const tasks=UH.ls.get('tasks',[]);const t=tasks.find(x=>x.id===id);if(t)t.done=!t.done;UH.ls.set('tasks',tasks);render();};
  window.tkDel=id=>{UH.ls.set('tasks',UH.ls.get('tasks',[]).filter(x=>x.id!==id));render();};
  window.tkFilter=f=>{filter=f;render();};
  render();
};

// ── Calendar ──
window.openCalendar = () => {
  let d=new Date(),sel=null,evs=UH.ls.get('cal2',{});
  const html=`
    <div style="display:flex;height:100%;background:#1c1c1e">
      <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <button class="app-btn btn-ghost" style="padding:6px 14px;border-radius:8px" onclick="calPrev()">‹</button>
          <span id="cal-title" style="font-size:18px;font-weight:600;color:white"></span>
          <button class="app-btn btn-ghost" style="padding:6px 14px;border-radius:8px" onclick="calNext()">›</button>
        </div>
        <div id="cal-grid" style="flex:1"></div>
      </div>
      <div id="cal-panel" style="width:220px;border-left:1px solid rgba(255,255,255,0.06);padding:14px;overflow-y:auto"></div>
    </div>`;
  UH.open('calendar','カレンダー','📅',html,560,460);

  const render=()=>{
    const y=d.getFullYear(),mo=d.getMonth();
    const first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
    const t=document.getElementById('cal-title');if(t)t.textContent=`${y}年${mo+1}月`;
    const g=document.getElementById('cal-grid');if(!g)return;
    const days_arr=[...Array(7)].map((_,i)=>`<div style="text-align:center;font-size:11px;font-weight:700;color:${i===0?'#ff453a':i===6?'#0071e3':'rgba(255,255,255,0.35)'};padding:4px">${['日','月','火','水','木','金','土'][i]}</div>`).join('');
    const empties=[...Array(first)].map(()=>'<div></div>').join('');
    const cells=[...Array(days)].map((_,i)=>{
      const date=new Date(y,mo,i+1),key=date.toDateString();
      const isToday=key===new Date().toDateString(),isSel=sel?.toDateString()===key,hasEv=(evs[key]||[]).length>0;
      return `<div onclick="calSel('${key}')" style="text-align:center;padding:7px 2px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:${isToday?700:400};position:relative;transition:background 0.1s;background:${isSel?'rgba(0,122,255,0.4)':isToday?'rgba(0,122,255,0.15)':'transparent'};color:${isToday?'#0071e3':'rgba(255,255,255,0.85)'}" onmouseover="if(!${isSel})this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background='${isSel?'rgba(0,122,255,0.4)':isToday?'rgba(0,122,255,0.15)':'transparent'}'">
        ${i+1}${hasEv?'<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#0071e3;display:block"></span>':''}
      </div>`;
    }).join('');
    g.innerHTML=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">${days_arr}${empties}${cells}</div>`;
    renderPanel();
  };
  const renderPanel=()=>{
    const p=document.getElementById('cal-panel');if(!p)return;
    if(!sel){p.innerHTML='<div style="font-size:13px;color:rgba(255,255,255,0.3);text-align:center;margin-top:40px">日付を選択</div>';return;}
    const key=sel.toDateString(),list=evs[key]||[];
    p.innerHTML=`
      <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:10px">${sel.toLocaleDateString('ja-JP',{month:'long',day:'numeric',weekday:'short'})}</div>
      ${list.map((e,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.2);border-radius:8px;padding:7px 10px;margin-bottom:6px;font-size:12px;color:white">📌 ${e}<button onclick="calDelEv('${key}',${i})" style="background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:13px">✕</button></div>`).join('')}
      <div style="display:flex;gap:6px;margin-top:8px">
        <input id="cal-inp" class="app-input" style="flex:1;padding:6px 10px;font-size:12px" placeholder="予定を追加..." onkeydown="if(event.key==='Enter')calAdd('${key}')">
        <button class="app-btn btn-blue" style="padding:6px 10px;font-size:14px;border-radius:8px" onclick="calAdd('${key}')">＋</button>
      </div>`;
  };
  window.calSel=key=>{sel=new Date(key);render();};
  window.calPrev=()=>{d=new Date(d.getFullYear(),d.getMonth()-1,1);render();};
  window.calNext=()=>{d=new Date(d.getFullYear(),d.getMonth()+1,1);render();};
  window.calAdd=key=>{const i=document.getElementById('cal-inp');if(!i?.value.trim())return;evs[key]=[...(evs[key]||[]),i.value.trim()];UH.ls.set('cal2',evs);i.value='';render();};
  window.calDelEv=(key,i)=>{evs[key]=(evs[key]||[]).filter((_,j)=>j!==i);UH.ls.set('cal2',evs);render();};
  setTimeout(()=>render(),50);
};

// ── Terminal ──
window.openTerminal = () => {
  const html=`
    <div style="display:flex;flex-direction:column;height:100%;background:#0d0d0d;font-family:'JetBrains Mono',monospace">
      <div id="tm-out" style="flex:1;overflow-y:auto;padding:14px;font-size:12.5px;line-height:1.8"></div>
      <div style="display:flex;align-items:center;padding:8px 14px;border-top:1px solid rgba(255,255,255,0.05)">
        <span style="color:#30d158;font-size:13px;white-space:nowrap;margin-right:8px"><span id="tm-user" style="color:#0071e3">${UH.ls.get('setup_name','user')}</span>@utilohub ~ % </span>
        <input id="tm-in" style="flex:1;background:none;border:none;outline:none;color:#30d158;font-family:'JetBrains Mono',monospace;font-size:12.5px;caret-color:#30d158" placeholder="" onkeydown="tmKey(event)">
      </div>
    </div>`;
  UH.open('terminal','ターミナル','💻',html,520,380);

  const cmds={
    help:()=>`使えるコマンド:\n  <span style="color:#0071e3">help</span>  clear  date  whoami  echo [text]\n  <span style="color:#0071e3">ls</span>  cat notes  neofetch  calc [式]\n  <span style="color:#0071e3">joke</span>  coin  dice  tasks  open [app]`,
    clear:()=>'__CLEAR__',
    date:()=>new Date().toLocaleString('ja-JP'),
    whoami:()=>`${UH.ls.get('setup_name','guest')}@utilohub`,
    ls:()=>'📁 <span style="color:#0071e3">apps</span>/  📁 <span style="color:#0071e3">notes</span>/  📁 <span style="color:#0071e3">tasks</span>/  📄 README.md',
    'cat notes':()=>{const n=UH.ls.get('notes2',[]);return n.length?n.map(x=>`📄 ${x.title}: ${(x.body||'').substring(0,40)}...`).join('\n'):'ノートなし';},
    tasks:()=>{const t=UH.ls.get('tasks',[]);return t.length?t.map(x=>`${x.done?'✅':'⬜'} ${x.text}`).join('\n'):'タスクなし';},
    neofetch:()=>`<span style="color:#0071e3">██╗   ██╗██╗  ██╗</span>   OS: UtiloHub 2.1\n<span style="color:#0071e3">██║   ██║██║  ██║</span>   Browser: ${navigator.userAgent.split(' ').pop()}\n<span style="color:#0071e3">██║   ██║███████║</span>   Screen: ${screen.width}×${screen.height}\n<span style="color:#0071e3">╚██████╔╝██╚══██║</span>   User: ${UH.ls.get('setup_name','guest')}\n<span style="color:#0071e3"> ╚═════╝ ╚═╝  ╚═╝</span>   Theme: Dark`,
    joke:()=>['なぜプログラマーは眼鏡をかける？— C#(シャープ)だから！','バグとは？— 予定外の機能のことです','デバッグ = 自分が書いたコードを読む作業'][Math.floor(Math.random()*3)],
    coin:()=>Math.random()>.5?'🪙 表 (HEAD)':'🌕 裏 (TAIL)',
    dice:()=>'🎲 '+([1,2,3,4,5,6][Math.floor(Math.random()*6)]),
  };
  let hist=[],hi=0;
  const print=(txt,color='#c9d1d9')=>{
    const o=document.getElementById('tm-out');if(!o)return;
    if(txt==='__CLEAR__'){o.innerHTML='';return;}
    const d=document.createElement('div');d.style.cssText=`color:${color};line-height:1.8;font-size:12.5px`;d.innerHTML=txt.replace(/\n/g,'<br>');o.appendChild(d);o.scrollTop=o.scrollHeight;
  };
  print(`<span style="color:#0071e3">UtiloHub Terminal</span> — "help" でコマンド一覧`);
  window.tmKey=e=>{
    const i=document.getElementById('tm-in');if(!i)return;
    if(e.key==='Enter'){
      const raw=i.value.trim();if(!raw)return;hist.unshift(raw);hi=0;
      print(`<span style="color:#30d158">${UH.ls.get('setup_name','user')}@utilohub</span> <span style="color:rgba(255,255,255,0.4)">%</span> ${raw}`);
      const parts=raw.split(' ');
      if(parts[0]==='echo')print(parts.slice(1).join(' '));
      else if(parts[0]==='calc'){try{const r=eval(parts.slice(1).join(' '));print(String(r),'#ffd60a');}catch{print('計算エラー','#ff453a');}}
      else if(parts[0]==='open'&&parts[1]){const fn='open'+parts[1].charAt(0).toUpperCase()+parts[1].slice(1);window[fn]?.()??print('アプリが見つかりません','#ff453a');}
      else if(cmds[raw])print(cmds[raw]());
      else if(cmds[parts[0]])print(cmds[parts[0]]());
      else print(`zsh: command not found: ${parts[0]}`,'#ff453a');
      i.value='';
    }else if(e.key==='ArrowUp'){if(hi<hist.length)i.value=hist[hi++];}
    else if(e.key==='ArrowDown'){hi=Math.max(0,hi-1);i.value=hist[hi]||'';}
  };
  setTimeout(()=>document.getElementById('tm-in')?.focus(),100);
};

// ── Music Player ──
window.openMusic = () => {
  const tracks=[
    {name:'Creative Minds', artist:'Bensound', url:'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',c:'#6366f1'},
    {name:'Acoustic Breeze',artist:'Bensound', url:'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',c:'#10b981'},
    {name:'Sunny',          artist:'Bensound', url:'https://www.bensound.com/bensound-music/bensound-sunny.mp3',c:'#f59e0b'},
    {name:'Ukulele',        artist:'Bensound', url:'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',c:'#ec4899'},
    {name:'Jazzy Frenchy',  artist:'Bensound', url:'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3',c:'#8b5cf6'},
  ];
  const html=`
    <div style="display:flex;flex-direction:column;height:100%;background:#1c1c1e;padding:20px;gap:16px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        <div class="music-disc" id="mc-disc" style="animation-play-state:paused"></div>
        <div style="text-align:center">
          <div id="mc-name"   style="font-size:17px;font-weight:600;color:white">Creative Minds</div>
          <div id="mc-artist" style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:3px">Bensound</div>
        </div>
      </div>
      <div>
        <input type="range" id="mc-seek" min="0" max="100" value="0" style="width:100%;height:3px;accent-color:#0071e3;cursor:pointer">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px"><span id="mc-cur">0:00</span><span id="mc-dur">0:00</span></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:20px">
        <button class="app-btn btn-ghost" style="padding:10px;font-size:20px;border-radius:50%;width:44px;height:44px" onclick="mcPrev()">⏮</button>
        <button class="app-btn btn-blue" id="mc-pbtn" style="padding:14px;font-size:22px;border-radius:50%;width:56px;height:56px" onclick="mcToggle()">▶</button>
        <button class="app-btn btn-ghost" style="padding:10px;font-size:20px;border-radius:50%;width:44px;height:44px" onclick="mcNext()">⏭</button>
      </div>
      <div style="flex:1;overflow-y:auto">
        ${tracks.map((t,i)=>`<div id="mc-t${i}" onclick="mcPick(${i})" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:background 0.1s" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background=document.getElementById('mc-t${i}').dataset.sel==='1'?'rgba(0,122,255,0.15)':'transparent'">
          <div style="width:8px;height:8px;border-radius:50%;background:${t.c};flex-shrink:0"></div>
          <div style="flex:1"><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85)">${t.name}</div><div style="font-size:11px;color:rgba(255,255,255,0.35)">${t.artist}</div></div>
          <div id="mc-pi${i}" style="display:none;font-size:12px;color:${t.c}">♫</div>
        </div>`).join('')}
      </div>
    </div>`;
  UH.open('music','音楽','🎵',html,320,560);
  setTimeout(()=>{
    if(!window._mcAudio){window._mcAudio=new Audio(tracks[0].url);window._mcAudio.volume=0.8;window._mcIdx=0;}
    const au=window._mcAudio;
    const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    const syncUI=()=>{
      const i=window._mcIdx;
      document.getElementById('mc-name').textContent=tracks[i].name;
      document.getElementById('mc-artist').textContent=tracks[i].artist;
      document.querySelectorAll('[id^=mc-pi]').forEach(e=>e.style.display='none');
      const pi=document.getElementById('mc-pi'+i);if(pi)pi.style.display='inline';
      document.querySelectorAll('[id^=mc-t]').forEach((e,j)=>{e.dataset.sel=j===i?'1':'0';e.style.background=j===i?'rgba(0,122,255,0.15)':'transparent';});
    };
    window.mcToggle=()=>{const d=document.getElementById('mc-disc');const b=document.getElementById('mc-pbtn');if(au.paused){au.play();if(d)d.style.animationPlayState='running';if(b)b.textContent='⏸';}else{au.pause();if(d)d.style.animationPlayState='paused';if(b)b.textContent='▶';}};
    window.mcPick=i=>{window._mcIdx=i;au.src=tracks[i].url;au.play();document.getElementById('mc-disc').style.animationPlayState='running';document.getElementById('mc-pbtn').textContent='⏸';syncUI();};
    window.mcNext=()=>window.mcPick((window._mcIdx+1)%tracks.length);
    window.mcPrev=()=>window.mcPick((window._mcIdx-1+tracks.length)%tracks.length);
    au.ontimeupdate=()=>{const sk=document.getElementById('mc-seek');if(sk&&!isNaN(au.duration)){sk.value=(au.currentTime/au.duration)*100;const c=document.getElementById('mc-cur');const d=document.getElementById('mc-dur');if(c)c.textContent=fmt(au.currentTime);if(d)d.textContent=fmt(au.duration);}};
    au.onended=()=>window.mcNext();
    const sk=document.getElementById('mc-seek');if(sk)sk.oninput=()=>{au.currentTime=(sk.value/100)*au.duration;};
    syncUI();if(!au.paused){document.getElementById('mc-disc').style.animationPlayState='running';document.getElementById('mc-pbtn').textContent='⏸';}
  },80);
};
