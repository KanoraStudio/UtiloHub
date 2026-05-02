// ===== Calculator, Clock, Weather, Pomodoro, Snake, Paint =====

// ── Calculator ──
export function openCalculator() {
  const html = `
    <div style="display:flex;flex-direction:column;height:100%;padding:12px;gap:10px">
      <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;text-align:right">
        <div id="calc-expr" style="font-size:12px;color:rgba(255,255,255,0.4);font-family:'JetBrains Mono',monospace;min-height:18px"></div>
        <div id="calc-disp" style="font-size:36px;font-weight:700;font-family:'JetBrains Mono',monospace;color:white;overflow:hidden;text-overflow:ellipsis">0</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1">
        ${[
          ['AC','clr','⌫','clr'],['(','ghost',')',  'ghost'],['%','ghost','÷','op'],
          ['7','','8',''],['9','','×','op'],
          ['4','','5',''],['6','','-','op'],
          ['1','','2',''],['3','','+','op'],
          ['±','','0', 'zero'],['.','',' ',''],['=','eq',' ',''],
        ].map(([a,ca,b,cb])=>`
          <button class="calc-btn ${ca}" onclick="calcInput('${a}')">${a}</button>
          <button class="calc-btn ${cb}" onclick="calcInput('${b}')">${b}</button>
        `).join('')}
      </div>
    </div>
  `;

  // Better layout
  const btns = [
    {l:'AC',c:'clr'},{l:'±',c:''},{l:'%',c:''},{l:'÷',c:'op'},
    {l:'7',c:''},{l:'8',c:''},{l:'9',c:''},{l:'×',c:'op'},
    {l:'4',c:''},{l:'5',c:''},{l:'6',c:''},{l:'-',c:'op'},
    {l:'1',c:''},{l:'2',c:''},{l:'3',c:''},{l:'+',c:'op'},
    {l:'⌫',c:'clr'},{l:'0',c:''},{l:'.',c:''},{l:'=',c:'eq'},
  ];
  const grid = btns.map(b=>`<button class="calc-btn ${b.c}" onclick="calcInput('${b.l}')">${b.l}</button>`).join('');
  const h = `
    <div style="display:flex;flex-direction:column;height:100%;padding:12px;gap:10px">
      <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px 20px;text-align:right">
        <div id="calc-expr" style="font-size:11px;color:rgba(255,255,255,0.35);font-family:'JetBrains Mono',monospace;min-height:16px"></div>
        <div id="calc-disp" style="font-size:40px;font-weight:700;font-family:'JetBrains Mono',monospace;color:white;overflow:hidden;text-overflow:ellipsis">0</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1">${grid}</div>
    </div>`;
  UH.createWindow('calculator', '電卓', '🧮', h, 300, 460);

  let disp='0', prev=null, op=null, rst=false;
  window.calcInput = key => {
    const d = document.getElementById('calc-disp');
    const e = document.getElementById('calc-expr');
    if (!d) return;
    if (key==='AC') { disp='0'; prev=null; op=null; rst=false; if(e)e.textContent=''; }
    else if (key==='⌫') { disp=disp.length>1?disp.slice(0,-1):'0'; }
    else if (key==='±') { disp=String(-parseFloat(disp)); }
    else if (key==='%') { disp=String(parseFloat(disp)/100); }
    else if (['+','-','×','÷'].includes(key)) {
      prev=parseFloat(disp); op=key; rst=true;
      if(e) e.textContent=`${prev} ${op}`;
    }
    else if (key==='=') {
      if(prev===null||!op){return;}
      const c=parseFloat(disp);
      let r=op==='+'?prev+c:op==='-'?prev-c:op==='×'?prev*c:c?prev/c:'Error';
      if(e) e.textContent=`${prev} ${op} ${c} =`;
      disp=String(r); prev=null; op=null; rst=true;
    }
    else if (key==='.') { if(!disp.includes('.')) disp+='.'; }
    else { if(rst){disp=key;rst=false;}else disp=disp==='0'?key:disp+key; }
    d.textContent=disp;
    // bounce animation
    d.style.transform='scale(1.05)'; setTimeout(()=>d.style.transform='',80);
  };
}
window.openCalculator = openCalculator;

// ── Analog Clock ──
export function openClock() {
  const h = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;padding:20px">
      <svg id="clock-svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="clockBg" cx="50%" cy="50%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f0f1a"/></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#clockBg)" stroke="rgba(99,102,241,0.4)" stroke-width="2"/>
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        ${[...Array(60)].map((_,i)=>{
          const a=(i*6-90)*Math.PI/180, big=i%5===0;
          const r1=big?72:78, r2=84;
          return `<line x1="${100+r1*Math.cos(a)}" y1="${100+r1*Math.sin(a)}" x2="${100+r2*Math.cos(a)}" y2="${100+r2*Math.sin(a)}" stroke="${big?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.2)'}" stroke-width="${big?2:1}"/>`;
        }).join('')}
        ${[...Array(12)].map((_,i)=>{
          const a=(i*30-60)*Math.PI/180, n=i===0?12:i;
          return `<text x="${100+60*Math.cos(a)}" y="${100+60*Math.sin(a)+4}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="11" font-family="Inter">${n}</text>`;
        }).join('')}
        <line id="ch" x1="100" y1="100" x2="100" y2="62" stroke="white" stroke-width="5" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <line id="cm" x1="100" y1="100" x2="100" y2="30" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <line id="cs" x1="100" y1="110" x2="100" y2="22" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <circle cx="100" cy="100" r="5" fill="white" filter="url(#glow)"/>
        <circle cx="100" cy="100" r="2" fill="#f87171"/>
      </svg>
      <div id="clock-digital" style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:white;letter-spacing:3px"></div>
      <div id="clock-date" style="font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:1px"></div>
      <div style="display:flex;gap:8px">
        <div style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:8px 16px;text-align:center">
          <div id="clock-tz" style="font-size:11px;color:rgba(255,255,255,0.4)">タイムゾーン</div>
          <div style="font-size:12px;color:white;font-weight:600">Asia/Tokyo</div>
        </div>
      </div>
    </div>`;
  UH.createWindow('clock', '時計', '🕐', h, 300, 420);

  const tick = () => {
    if (!document.getElementById('clock-digital')) return;
    const now = new Date();
    const h=now.getHours(), m=now.getMinutes(), s=now.getSeconds(), ms=now.getMilliseconds();
    const hd = document.getElementById('ch'), md=document.getElementById('cm'), sd=document.getElementById('cs');
    const digi = document.getElementById('clock-digital'), date=document.getElementById('clock-date');
    if (hd) hd.style.transform = `rotate(${(h%12+m/60)*30}deg)`;
    if (md) md.style.transform = `rotate(${(m+s/60)*6}deg)`;
    if (sd) sd.style.transform = `rotate(${(s+ms/1000)*6}deg)`;
    if (digi) digi.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (date) date.textContent = now.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
    window._clockTimer = requestAnimationFrame(tick);
  };
  tick();
}
window.openClock = openClock;

// ── Weather ──
export function openWeather() {
  const h = `
    <div style="display:flex;flex-direction:column;height:100%;padding:16px;gap:12px">
      <div style="display:flex;gap:8px">
        <input id="weather-input" class="input" style="flex:1;padding:8px 12px;font-size:13px" placeholder="都市名（例: Tokyo, London）" value="Tokyo" onkeydown="if(event.key==='Enter')fetchWeather()">
        <button class="btn btn-primary" style="padding:8px 16px;font-size:13px" onclick="fetchWeather()">🔍</button>
      </div>
      <div id="weather-body" style="flex:1;overflow-y:auto">
        <div style="text-align:center;color:rgba(255,255,255,0.3);margin-top:40px">検索してください</div>
      </div>
    </div>`;
  UH.createWindow('weather', '天気', '🌤', h, 360, 440);

  window.fetchWeather = async () => {
    const city = document.getElementById('weather-input')?.value || 'Tokyo';
    const body = document.getElementById('weather-body');
    if (!body) return;
    body.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;animation:pulse 1s infinite">🌍 読み込み中...</div>';
    try {
      const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const d = await r.json();
      const cur = d.current_condition[0];
      const weather3 = d.weather?.slice(0,3) || [];
      const icons = {'Sunny':'☀️','Clear':'🌙','Cloudy':'☁️','Overcast':'☁️','Rain':'🌧','Snow':'❄️','Thunder':'⛈','Fog':'🌫','Mist':'🌫','Partly':'⛅'};
      const getIcon = desc => { for(const [k,v] of Object.entries(icons)) if(desc.includes(k)) return v; return '🌤'; };
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="weather-card" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));text-align:center;padding:20px">
            <div style="font-size:56px">${getIcon(cur.weatherDesc[0].value)}</div>
            <div style="font-size:48px;font-weight:800;color:white;line-height:1">${cur.temp_C}°C</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-top:6px">${city} · ${cur.weatherDesc[0].value}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px">
              <div><div style="font-size:10px;color:rgba(255,255,255,0.4)">湿度</div><div style="font-size:16px;font-weight:700;color:#60a5fa">${cur.humidity}%</div></div>
              <div><div style="font-size:10px;color:rgba(255,255,255,0.4)">体感</div><div style="font-size:16px;font-weight:700;color:#34d399">${cur.FeelsLikeC}°C</div></div>
              <div><div style="font-size:10px;color:rgba(255,255,255,0.4)">風速</div><div style="font-size:16px;font-weight:700;color:#f59e0b">${cur.windspeedKmph}km/h</div></div>
            </div>
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:1px">3日間予報</div>
          ${weather3.map(w=>`
            <div class="weather-card" style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:rgba(255,255,255,0.7)">${new Date(w.date).toLocaleDateString('ja-JP',{month:'short',day:'numeric',weekday:'short'})}</span>
              <span style="font-size:24px">${getIcon(w.hourly[4]?.weatherDesc[0]?.value||'')}</span>
              <span style="font-size:13px;color:#60a5fa">${w.mintempC}° / <span style="color:#f87171">${w.maxtempC}°</span></span>
            </div>`).join('')}
        </div>`;
    } catch { body.innerHTML='<div style="color:#f87171;text-align:center;padding:40px">❌ 取得失敗。都市名を確認してください。</div>'; }
  };
  setTimeout(()=>window.fetchWeather(), 100);
}
window.openWeather = openWeather;

// ── Pomodoro Timer ──
export function openPomodoro() {
  const h = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;gap:20px">
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" id="pomo-work-btn" style="padding:6px 16px;font-size:12px" onclick="pomoSetMode('work')">作業 25分</button>
        <button class="btn btn-ghost"   id="pomo-short-btn" style="padding:6px 16px;font-size:12px" onclick="pomoSetMode('short')">短休憩 5分</button>
        <button class="btn btn-ghost"   id="pomo-long-btn"  style="padding:6px 16px;font-size:12px" onclick="pomoSetMode('long')">長休憩 15分</button>
      </div>
      <div style="position:relative;width:180px;height:180px">
        <svg class="pomo-ring" width="180" height="180">
          <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
          <circle id="pomo-circle" class="pomo-circle" cx="90" cy="90" r="80" fill="none" stroke="url(#pomoGrad)" stroke-width="10"
            stroke-dasharray="502" stroke-dashoffset="0" stroke-linecap="round"/>
          <defs><linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">
          <div id="pomo-time" style="font-family:'JetBrains Mono',monospace;font-size:42px;font-weight:800;color:white">25:00</div>
          <div id="pomo-label" style="font-size:12px;color:rgba(255,255,255,0.4)">作業時間</div>
        </div>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-success" id="pomo-start" style="padding:10px 28px;font-size:14px" onclick="pomoToggle()">▶ スタート</button>
        <button class="btn btn-ghost"   style="padding:10px 20px;font-size:14px" onclick="pomoReset()">↺</button>
      </div>
      <div id="pomo-sessions" style="font-size:12px;color:rgba(255,255,255,0.4)">今日: 0 ポモドーロ完了</div>
    </div>`;
  UH.createWindow('pomodoro', 'ポモドーロ', '🍅', h, 320, 460);

  const modes = { work:{secs:25*60,label:'作業時間',color:'#6366f1'}, short:{secs:5*60,label:'短い休憩',color:'#10b981'}, long:{secs:15*60,label:'長い休憩',color:'#8b5cf6'} };
  let mode='work', remaining=modes.work.secs, running=false, sessions=UH.ls.get('pomo_sessions',0);
  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const updateUI = () => {
    const t=document.getElementById('pomo-time'); if(!t)return;
    t.textContent=fmt(remaining);
    const circ=document.getElementById('pomo-circle');
    if(circ){ const pct=remaining/modes[mode].secs; circ.style.strokeDashoffset=502*(1-pct); }
    document.getElementById('pomo-sessions').textContent=`今日: ${sessions} ポモドーロ完了`;
  };
  window.pomoSetMode = m => {
    mode=m; remaining=modes[m].secs; running=false; clearInterval(window._pomoTimer);
    document.getElementById('pomo-start').textContent='▶ スタート';
    document.getElementById('pomo-label').textContent=modes[m].label;
    ['work','short','long'].forEach(x=>{
      const b=document.getElementById(`pomo-${x}-btn`);
      if(b){b.className=x===m?'btn btn-primary':'btn btn-ghost';b.style.cssText='padding:6px 16px;font-size:12px';}
    });
    updateUI();
  };
  window.pomoToggle = () => {
    running=!running;
    document.getElementById('pomo-start').textContent=running?'⏸ 一時停止':'▶ スタート';
    if(running) window._pomoTimer=setInterval(()=>{
      if(--remaining<=0){
        clearInterval(window._pomoTimer); running=false;
        if(mode==='work'){sessions++;UH.ls.set('pomo_sessions',sessions);}
        UH.notify(mode==='work'?'🍅 ポモドーロ完了！休憩しましょう':'✅ 休憩終了！作業再開','🍅','#6366f1');
        window.pomoSetMode(mode==='work'?'short':'work');
      } else updateUI();
    },1000);
    else clearInterval(window._pomoTimer);
  };
  window.pomoReset = () => { clearInterval(window._pomoTimer); window.pomoSetMode(mode); };
  document.getElementById('pomo-sessions').textContent=`今日: ${sessions} ポモドーロ完了`;
}
window.openPomodoro = openPomodoro;

// ── Snake Game ──
export function openSnake() {
  const h = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;gap:12px;background:#0a0a0f">
      <div style="display:flex;justify-content:space-between;width:300px;align-items:center">
        <span style="color:rgba(255,255,255,0.6);font-size:13px">スコア: <span id="snake-score" style="color:#34d399;font-weight:700;font-family:'JetBrains Mono',monospace">0</span></span>
        <span style="color:rgba(255,255,255,0.4);font-size:11px">矢印キー or WASD</span>
        <button class="btn btn-primary" style="padding:4px 12px;font-size:11px" onclick="snakeRestart()">再スタート</button>
      </div>
      <canvas id="snake-canvas" width="300" height="300"></canvas>
      <div id="snake-over" style="display:none;position:absolute;background:rgba(0,0,0,0.7);border-radius:12px;padding:20px 32px;text-align:center">
        <div style="font-size:32px">💀</div>
        <div style="color:white;font-weight:700;margin:8px 0">ゲームオーバー</div>
        <button class="btn btn-primary" style="padding:8px 20px" onclick="snakeRestart()">もう一度</button>
      </div>
    </div>`;
  UH.createWindow('snake', 'スネーク', '🐍', h, 340, 420);

  setTimeout(()=>{
    const canvas=document.getElementById('snake-canvas'); if(!canvas)return;
    const ctx=canvas.getContext('2d'); const S=15, W=canvas.width/S, H=canvas.height/S;
    let snake, dir, food, score, alive, loop;
    const init = ()=>{
      snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; score=0; alive=true;
      food={x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)};
      document.getElementById('snake-score').textContent='0';
      document.getElementById('snake-over').style.display='none';
    };
    const draw = ()=>{
      ctx.fillStyle='#0a0a0f'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // grid
      ctx.strokeStyle='rgba(255,255,255,0.04)';
      for(let i=0;i<W;i++){ctx.beginPath();ctx.moveTo(i*S,0);ctx.lineTo(i*S,canvas.height);ctx.stroke();}
      for(let j=0;j<H;j++){ctx.beginPath();ctx.moveTo(0,j*S);ctx.lineTo(canvas.width,j*S);ctx.stroke();}
      // food
      ctx.fillStyle='#f87171'; ctx.shadowColor='#f87171'; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(food.x*S+S/2,food.y*S+S/2,S/2-1,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      // snake
      snake.forEach((seg,i)=>{
        const pct=i/snake.length;
        ctx.fillStyle=`hsl(${240+pct*60},80%,${60-pct*20}%)`;
        ctx.shadowColor=i===0?'#6366f1':'transparent'; ctx.shadowBlur=i===0?12:0;
        ctx.beginPath(); ctx.roundRect(seg.x*S+1,seg.y*S+1,S-2,S-2,4); ctx.fill();
      });
      ctx.shadowBlur=0;
    };
    const step = ()=>{
      if(!alive)return;
      const head={x:(snake[0].x+dir.x+W)%W,y:(snake[0].y+dir.y+H)%H};
      if(snake.some(s=>s.x===head.x&&s.y===head.y)){ alive=false; document.getElementById('snake-over').style.display='block'; return; }
      snake.unshift(head);
      if(head.x===food.x&&head.y===food.y){
        score+=10; document.getElementById('snake-score').textContent=score;
        food={x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)};
        UH.notify(`+10 スコア: ${score}`, '🐍', '#34d399');
      } else snake.pop();
      draw();
    };
    document.addEventListener('keydown',e=>{
      if(!document.getElementById('snake-canvas'))return;
      const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyW:{x:0,y:-1},KeyS:{x:0,y:1},KeyA:{x:-1,y:0},KeyD:{x:1,y:0}};
      const nd=m[e.code]; if(nd&&!(nd.x===-dir.x&&nd.y===-dir.y)){dir=nd;e.preventDefault();}
    });
    window.snakeRestart=()=>{clearInterval(loop);init();draw();loop=setInterval(step,120);};
    window.snakeRestart();
  },100);
}
window.openSnake = openSnake;

// ── Paint ──
export function openPaint() {
  const h = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:8px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.06);flex-wrap:wrap">
        <input type="color" id="paint-color" value="#6366f1" style="width:32px;height:32px;border:none;background:none;cursor:pointer;border-radius:6px">
        <input type="range" id="paint-size" min="1" max="40" value="5" style="width:80px;accent-color:#6366f1">
        <span id="paint-size-label" style="font-size:11px;color:rgba(255,255,255,0.4)">5px</span>
        <button class="btn btn-ghost" id="paint-eraser" style="padding:4px 10px;font-size:12px" onclick="paintSetEraser()">🩹 消しゴム</button>
        <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" onclick="document.getElementById('paint-canvas').getContext('2d').clearRect(0,0,600,450)">🗑 全消し</button>
        <button class="btn btn-primary" style="padding:4px 10px;font-size:12px" onclick="paintDownload()">💾 保存</button>
        ${['#f87171','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6','white','#374151'].map(c=>`<div onclick="document.getElementById('paint-color').value='${c}';window._paintEraser=false;" style="width:18px;height:18px;border-radius:4px;background:${c};cursor:pointer;border:1px solid rgba(255,255,255,0.2)"></div>`).join('')}
      </div>
      <canvas id="paint-canvas" width="600" height="400" style="flex:1;background:#111;cursor:crosshair"></canvas>
    </div>`;
  UH.createWindow('paint', 'ペイント', '🎨', h, 640, 500);

  setTimeout(()=>{
    const canvas=document.getElementById('paint-canvas'); if(!canvas)return;
    const ctx=canvas.getContext('2d');
    let drawing=false;
    window._paintEraser=false;
    const sz=document.getElementById('paint-size');
    const lbl=document.getElementById('paint-size-label');
    if(sz&&lbl){sz.oninput=()=>lbl.textContent=sz.value+'px';}
    const getColor=()=>window._paintEraser?'#111':document.getElementById('paint-color').value;
    const getSize=()=>parseInt(document.getElementById('paint-size').value);
    canvas.onmousedown=e=>{drawing=true;ctx.beginPath();ctx.moveTo(e.offsetX,e.offsetY);};
    canvas.onmousemove=e=>{if(!drawing)return;ctx.lineWidth=getSize();ctx.strokeStyle=getColor();ctx.lineCap='round';ctx.lineTo(e.offsetX,e.offsetY);ctx.stroke();};
    canvas.onmouseup=canvas.onmouseleave=()=>{drawing=false;};
    window.paintSetEraser=()=>{window._paintEraser=!window._paintEraser;document.getElementById('paint-eraser').style.background=window._paintEraser?'rgba(99,102,241,0.3)':'';};
    window.paintDownload=()=>{const a=document.createElement('a');a.href=canvas.toDataURL();a.download='utilohub_paint.png';a.click();UH.notify('画像を保存しました','🎨','#ec4899');};
  },100);
}
window.openPaint = openPaint;
