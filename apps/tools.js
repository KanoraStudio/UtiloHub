// ===== Calculator, Clock, Weather, Pomodoro, Snake, Paint, Settings =====

// ── Calculator (macOS style) ──
window.openCalculator = () => {
  const btns = [
    {l:'AC',c:'dark',s:1},{l:'+/-',c:'dark'},{l:'%',c:'dark'},{l:'÷',c:'orange'},
    {l:'7',c:''},{l:'8',c:''},{l:'9',c:''},{l:'×',c:'orange'},
    {l:'4',c:''},{l:'5',c:''},{l:'6',c:''},{l:'-',c:'orange'},
    {l:'1',c:''},{l:'2',c:''},{l:'3',c:''},{l:'+',c:'orange'},
    {l:'0',c:'',span:2},{l:'.',c:''},{l:'=',c:'orange'},
  ];
  const grid = btns.map(b=>`<button class="calc-btn ${b.c}" style="${b.span?'grid-column:span 2;border-radius:40px;':''}aspect-ratio:${b.span?'unset':'1'};${b.span?'padding:0 0 0 24px;justify-content:flex-start;':''}font-size:${b.c==='dark'||b.c===''?'22':'24'}px" onclick="calcKey('${b.l}')">${b.l}</button>`).join('');
  const html = `
    <div style="display:flex;flex-direction:column;height:100%;padding:16px;gap:10px;background:#1c1c1e">
      <div style="text-align:right;padding:0 8px">
        <div id="calc-hist" style="font-size:18px;color:rgba(255,255,255,0.35);min-height:24px;font-family:-apple-system,'Inter',sans-serif"></div>
        <div id="calc-disp" style="font-size:64px;font-weight:200;color:white;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">0</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;flex:1">${grid}</div>
    </div>`;
  UH.open('calculator','電卓','🧮',html,320,500);

  let disp='0',prev=null,op=null,rst=false,activeOp=null;
  const setDisp = v => { const d=document.getElementById('calc-disp'); if(d){d.textContent=v;d.style.fontSize=v.length>10?'32px':v.length>7?'44px':'64px';} };
  const setHist = v => { const h=document.getElementById('calc-hist'); if(h)h.textContent=v; };
  const updOp = o => { document.querySelectorAll('.calc-btn.orange').forEach(b=>b.classList.toggle('active-op',b.textContent===o)); };
  window.calcKey = key => {
    if(key==='AC'){disp='0';prev=null;op=null;rst=false;activeOp=null;setHist('');updOp(null);}
    else if(key==='+/-'){disp=String(-parseFloat(disp)||0);}
    else if(key==='%'){disp=String(parseFloat(disp)/100);}
    else if(['÷','×','-','+'].includes(key)){
      prev=parseFloat(disp);op=key;rst=true;activeOp=key;
      setHist(`${prev} ${op}`); updOp(key);
    }
    else if(key==='='){
      if(prev===null||!op)return;
      const c=parseFloat(disp);
      const ops={'÷':(a,b)=>b?a/b:'Error','×':(a,b)=>a*b,'-':(a,b)=>a-b,'+':(a,b)=>a+b};
      let r=ops[op]?.(prev,c);
      if(typeof r==='number') r=parseFloat(r.toPrecision(12));
      setHist(`${prev} ${op} ${c} =`);
      disp=String(r??'Error');prev=null;op=null;rst=true;activeOp=null;updOp(null);
    }
    else if(key==='.'){if(!disp.includes('.')){disp+='.';}}
    else{if(rst){disp=key;rst=false;}else disp=disp==='0'?key:disp+key;}
    setDisp(disp);
  };
};

// ── Analog Clock ──
window.openClock = () => {
  const ticks = [...Array(60)].map((_,i)=>{
    const a=(i*6-90)*Math.PI/180, big=i%5===0;
    const r1=big?68:74,r2=80;
    return `<line x1="${100+r1*Math.cos(a)}" y1="${100+r1*Math.sin(a)}" x2="${100+r2*Math.cos(a)}" y2="${100+r2*Math.sin(a)}" stroke="${big?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.15)'}" stroke-width="${big?2:1}"/>`;
  }).join('');
  const nums = [...Array(12)].map((_,i)=>{
    const a=(i*30-60)*Math.PI/180,n=i===0?12:i;
    return `<text x="${100+60*Math.cos(a)}" y="${100+60*Math.sin(a)+4}" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="11" font-family="-apple-system,Inter">${n}</text>`;
  }).join('');
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;background:#1c1c1e;padding:24px">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="cg" cx="50%" cy="40%"><stop offset="0%" stop-color="#2c2c2e"/><stop offset="100%" stop-color="#1c1c1e"/></radialGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill="url(#cg)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        ${ticks}${nums}
        <line id="ch" x1="100" y1="100" x2="100" y2="65" stroke="white" stroke-width="5" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <line id="cm" x1="100" y1="100" x2="100" y2="30" stroke="white" stroke-width="3" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <line id="cs" x1="100" y1="116" x2="100" y2="25" stroke="#ff453a" stroke-width="1.5" stroke-linecap="round" style="transform-origin:100px 100px"/>
        <circle cx="100" cy="100" r="4" fill="white"/>
        <circle cx="100" cy="100" r="2" fill="#ff453a"/>
      </svg>
      <div id="clk-digi" style="font-size:32px;font-weight:200;color:white;font-family:-apple-system,'Inter',sans-serif;letter-spacing:2px"></div>
      <div id="clk-date" style="font-size:14px;color:rgba(255,255,255,0.4);font-weight:300"></div>
    </div>`;
  UH.open('clock','時計','🕐',html,280,420);
  const tick=()=>{
    if(!document.getElementById('ch'))return;
    const n=new Date(),h=n.getHours(),m=n.getMinutes(),s=n.getSeconds(),ms=n.getMilliseconds();
    document.getElementById('ch').style.transform=`rotate(${(h%12+m/60)*30}deg)`;
    document.getElementById('cm').style.transform=`rotate(${(m+s/60)*6}deg)`;
    document.getElementById('cs').style.transform=`rotate(${(s+ms/1000)*6}deg)`;
    document.getElementById('clk-digi').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    document.getElementById('clk-date').textContent=n.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
    requestAnimationFrame(tick);
  };
  tick();
};

// ── Weather ──
window.openWeather = () => {
  const html = `
    <div style="display:flex;flex-direction:column;height:100%;background:#1c1c1e">
      <div style="padding:12px 16px;display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <input id="w-inp" class="app-input" style="flex:1;padding:8px 12px;font-size:14px" placeholder="都市名（例: Tokyo）" value="Tokyo" onkeydown="if(event.key==='Enter')doWeather()">
        <button class="app-btn btn-blue" style="padding:8px 16px;font-size:13px" onclick="doWeather()">検索</button>
      </div>
      <div id="w-body" style="flex:1;overflow-y:auto;padding:16px"></div>
    </div>`;
  UH.open('weather','天気','🌤',html,360,460);
  window.doWeather = async () => {
    const city=document.getElementById('w-inp')?.value||'Tokyo';
    const body=document.getElementById('w-body'); if(!body)return;
    body.innerHTML='<div style="text-align:center;padding:60px;color:rgba(255,255,255,0.3)">読み込み中...</div>';
    try {
      const d=await(await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)).json();
      const c=d.current_condition[0];
      const gi=s=>{const m={'Sunny':'☀️','Clear':'🌙','Cloud':'☁️','Rain':'🌧','Snow':'❄️','Thunder':'⛈','Fog':'🌫','Mist':'🌫','Partly':'⛅','Overcast':'☁️'};for(const[k,v]of Object.entries(m))if(s?.includes(k))return v;return'🌤';};
      body.innerHTML=`
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:72px;line-height:1">${gi(c.weatherDesc[0].value)}</div>
          <div style="font-size:56px;font-weight:200;color:white;margin:8px 0">${c.temp_C}°</div>
          <div style="font-size:16px;color:rgba(255,255,255,0.5)">${city}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.35);margin-top:4px">${c.weatherDesc[0].value}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0">
          ${[['💧','湿度',c.humidity+'%'],['🌡','体感',c.FeelsLikeC+'°'],['💨','風速',c.windspeedKmph+'km/h']].map(([ic,lb,vl])=>`
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:22px">${ic}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin:4px 0">${lb}</div>
            <div style="font-size:15px;font-weight:600;color:white">${vl}</div>
          </div>`).join('')}
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:1px;margin:16px 0 8px">3日間予報</div>
        ${(d.weather||[]).slice(0,3).map(w=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:6px">
          <span style="font-size:13px;color:rgba(255,255,255,0.6);width:100px">${new Date(w.date).toLocaleDateString('ja-JP',{month:'short',day:'numeric',weekday:'short'})}</span>
          <span style="font-size:24px">${gi(w.hourly[4]?.weatherDesc[0]?.value)}</span>
          <span style="font-size:13px;color:#60a5fa;font-weight:600">${w.mintempC}° <span style="color:rgba(255,255,255,0.3)">/ </span><span style="color:#f87171">${w.maxtempC}°</span></span>
        </div>`).join('')}`;
    } catch { body.innerHTML='<div style="color:#ff453a;text-align:center;padding:40px">取得に失敗しました</div>'; }
  };
  setTimeout(()=>window.doWeather(),80);
};

// ── Pomodoro ──
window.openPomodoro = () => {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;background:#1c1c1e;padding:24px">
      <div style="display:flex;gap:8px">
        <button id="pm-w" class="app-btn btn-blue"   style="padding:6px 16px;font-size:12px;border-radius:20px" onclick="pmMode('work')">作業</button>
        <button id="pm-s" class="app-btn btn-ghost"  style="padding:6px 16px;font-size:12px;border-radius:20px" onclick="pmMode('short')">短休憩</button>
        <button id="pm-l" class="app-btn btn-ghost"  style="padding:6px 16px;font-size:12px;border-radius:20px" onclick="pmMode('long')">長休憩</button>
      </div>
      <div style="position:relative;width:200px;height:200px">
        <svg class="pomo-ring" width="200" height="200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="10"/>
          <circle id="pm-prog" class="pomo-prog" cx="100" cy="100" r="88" fill="none" stroke="#0071e3" stroke-width="10" stroke-dasharray="553" stroke-dashoffset="0" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
          <div id="pm-time" style="font-size:48px;font-weight:200;color:white;font-family:-apple-system,'Inter',sans-serif">25:00</div>
          <div id="pm-lbl"  style="font-size:12px;color:rgba(255,255,255,0.4)">作業時間</div>
        </div>
      </div>
      <div style="display:flex;gap:12px">
        <button id="pm-btn" class="app-btn btn-blue" style="padding:12px 32px;font-size:15px;border-radius:12px" onclick="pmToggle()">▶ スタート</button>
        <button class="app-btn btn-ghost" style="padding:12px 16px;font-size:18px;border-radius:12px" onclick="pmReset()">↺</button>
      </div>
      <div id="pm-sess" style="font-size:13px;color:rgba(255,255,255,0.3)">今日: 0 ポモドーロ</div>
    </div>`;
  UH.open('pomodoro','ポモドーロ','🍅',html,320,480);

  const modes={work:{s:25*60,l:'作業時間',c:'#0071e3'},short:{s:5*60,l:'短い休憩',c:'#30d158'},long:{s:15*60,l:'長い休憩',c:'#ff9f0a'}};
  let mode='work',rem=modes.work.s,run=false,sess=UH.ls.get('pomo',0);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const upd=()=>{
    const t=document.getElementById('pm-time');if(!t)return;
    t.textContent=fmt(rem);
    const p=document.getElementById('pm-prog');
    if(p){p.style.strokeDashoffset=553*(1-rem/modes[mode].s);p.style.stroke=modes[mode].c;}
    document.getElementById('pm-sess').textContent=`今日: ${sess} ポモドーロ`;
  };
  window.pmMode=m=>{
    mode=m;rem=modes[m].s;run=false;clearInterval(window._pmT);
    document.getElementById('pm-btn').textContent='▶ スタート';
    document.getElementById('pm-lbl').textContent=modes[m].l;
    ['w','s','l'].forEach((x,i)=>{const b=document.getElementById('pm-'+x);const mk=['work','short','long'][i];if(b){b.className='app-btn '+(m===mk?'btn-blue':'btn-ghost');b.style.cssText='padding:6px 16px;font-size:12px;border-radius:20px';}});
    upd();
  };
  window.pmToggle=()=>{
    run=!run;document.getElementById('pm-btn').textContent=run?'⏸ 一時停止':'▶ スタート';
    if(run)window._pmT=setInterval(()=>{if(--rem<=0){clearInterval(window._pmT);run=false;if(mode==='work'){sess++;UH.ls.set('pomo',sess);}UH.notify(mode==='work'?'ポモドーロ完了！':'休憩終了！','','🍅','#0071e3');window.pmMode(mode==='work'?'short':'work');}else upd();},1000);
    else clearInterval(window._pmT);
  };
  window.pmReset=()=>{clearInterval(window._pmT);window.pmMode(mode);};
};

// ── Snake ──
window.openSnake = () => {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#1c1c1e;gap:12px;padding:16px">
      <div style="display:flex;justify-content:space-between;width:300px;align-items:center">
        <span style="color:rgba(255,255,255,0.5);font-size:13px">スコア: <b id="sk-score" style="color:#30d158;font-family:'JetBrains Mono',monospace">0</b></span>
        <span style="color:rgba(255,255,255,0.3);font-size:11px">↑↓←→ / WASD</span>
        <button class="app-btn btn-ghost" style="padding:4px 12px;font-size:11px;border-radius:8px" onclick="skRestart()">再スタート</button>
      </div>
      <canvas id="snake-canvas" width="300" height="300" style="border-radius:10px;border:1px solid rgba(255,255,255,0.08)"></canvas>
      <div id="sk-over" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.7);border-radius:12px;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px">
        <div style="font-size:48px">💀</div>
        <div style="color:white;font-size:18px;font-weight:600">ゲームオーバー</div>
        <button class="app-btn btn-blue" style="padding:10px 24px;border-radius:10px" onclick="skRestart()">もう一度</button>
      </div>
    </div>`;
  UH.open('snake','スネーク','🐍',html,340,420);
  setTimeout(()=>{
    const cv=document.getElementById('snake-canvas');if(!cv)return;
    const cx=cv.getContext('2d');const S=15,W=cv.width/S,H=cv.height/S;
    let snake,dir,food,score,alive,loop;
    const rnd=()=>({x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)});
    const init=()=>{snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};food=rnd();score=0;alive=true;document.getElementById('sk-score').textContent='0';const ov=document.getElementById('sk-over');if(ov)ov.style.display='none';};
    const draw=()=>{
      cx.fillStyle='#1c1c1e';cx.fillRect(0,0,cv.width,cv.height);
      cx.strokeStyle='rgba(255,255,255,0.03)';cx.lineWidth=0.5;
      for(let i=0;i<=W;i++){cx.beginPath();cx.moveTo(i*S,0);cx.lineTo(i*S,cv.height);cx.stroke();}
      for(let j=0;j<=H;j++){cx.beginPath();cx.moveTo(0,j*S);cx.lineTo(cv.width,j*S);cx.stroke();}
      cx.fillStyle='#ff453a';cx.shadowColor='#ff453a';cx.shadowBlur=12;
      cx.beginPath();cx.arc(food.x*S+S/2,food.y*S+S/2,S/2-1,0,Math.PI*2);cx.fill();cx.shadowBlur=0;
      snake.forEach((seg,i)=>{
        const t=i/snake.length;
        cx.fillStyle=`hsl(${210+t*30},85%,${62-t*18}%)`;
        cx.shadowColor=i===0?'rgba(0,122,255,0.6)':'transparent';cx.shadowBlur=i===0?10:0;
        cx.beginPath();cx.roundRect(seg.x*S+1,seg.y*S+1,S-2,S-2,4);cx.fill();
      });cx.shadowBlur=0;
    };
    const step=()=>{
      if(!alive)return;
      const h={x:(snake[0].x+dir.x+W)%W,y:(snake[0].y+dir.y+H)%H};
      if(snake.some(s=>s.x===h.x&&s.y===h.y)){alive=false;const ov=document.getElementById('sk-over');if(ov)ov.style.display='flex';return;}
      snake.unshift(h);
      if(h.x===food.x&&h.y===food.y){score+=10;document.getElementById('sk-score').textContent=score;food=rnd();}else snake.pop();
      draw();
    };
    const km=e=>{if(!document.getElementById('snake-canvas'))return;const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyW:{x:0,y:-1},KeyS:{x:0,y:1},KeyA:{x:-1,y:0},KeyD:{x:1,y:0}};const nd=m[e.code];if(nd&&!(nd.x===-dir.x&&nd.y===-dir.y)){dir=nd;e.preventDefault();}};
    document.addEventListener('keydown',km);
    window.skRestart=()=>{clearInterval(loop);init();draw();loop=setInterval(step,115);};
    window.skRestart();
  },100);
};

// ── Paint ──
window.openPaint = () => {
  const colors=['#ff453a','#ff9f0a','#ffd60a','#30d158','#0071e3','#6e56cf','#bf5af2','#ff375f','white','#636366','#2c2c2e'];
  const html = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);flex-wrap:wrap;background:rgba(28,28,30,0.9)">
        <input type="color" id="pt-col" value="#0071e3" style="width:30px;height:30px;border:none;background:none;cursor:pointer;border-radius:6px">
        <div style="display:flex;flex-wrap:wrap;gap:4px;max-width:140px">
          ${colors.map(c=>`<div onclick="document.getElementById('pt-col').value='${c}';window._ptErase=false;" style="width:16px;height:16px;border-radius:4px;background:${c};cursor:pointer;border:1px solid rgba(255,255,255,0.15);transition:transform 0.1s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform=''"></div>`).join('')}
        </div>
        <input type="range" id="pt-size" min="1" max="50" value="5" style="width:70px;accent-color:#0071e3">
        <span id="pt-sl" style="font-size:11px;color:rgba(255,255,255,0.35);min-width:24px">5px</span>
        <button class="app-btn btn-ghost" id="pt-er-btn" style="padding:4px 10px;font-size:12px;border-radius:8px" onclick="window._ptErase=!window._ptErase;this.style.background=window._ptErase?'rgba(0,122,255,0.3)':''">消しゴム</button>
        <button class="app-btn btn-ghost" style="padding:4px 10px;font-size:12px;border-radius:8px" onclick="document.getElementById('pt-cv').getContext('2d').clearRect(0,0,1200,800)">全消し</button>
        <button class="app-btn btn-blue" style="padding:4px 10px;font-size:12px;border-radius:8px" onclick="const a=document.createElement('a');a.href=document.getElementById('pt-cv').toDataURL();a.download='drawing.png';a.click()">保存</button>
      </div>
      <canvas id="pt-cv" style="flex:1;cursor:crosshair;background:#111;display:block;width:100%;"></canvas>
    </div>`;
  UH.open('paint','ペイント','🎨',html,680,520);
  setTimeout(()=>{
    const cv=document.getElementById('pt-cv');if(!cv)return;
    cv.width=cv.offsetWidth||680;cv.height=cv.offsetHeight||440;
    const cx=cv.getContext('2d');let drawing=false;
    window._ptErase=false;
    document.getElementById('pt-size').oninput=function(){document.getElementById('pt-sl').textContent=this.value+'px';};
    const getC=()=>window._ptErase?'#111':document.getElementById('pt-col').value;
    const getS=()=>parseInt(document.getElementById('pt-size').value);
    cv.onmousedown=e=>{drawing=true;cx.beginPath();cx.moveTo(e.offsetX,e.offsetY);};
    cv.onmousemove=e=>{if(!drawing)return;cx.lineWidth=getS();cx.strokeStyle=getC();cx.lineCap='round';cx.lineJoin='round';cx.lineTo(e.offsetX,e.offsetY);cx.stroke();};
    cv.onmouseup=cv.onmouseleave=()=>{drawing=false;};
  },100);
};

// ── Settings ──
window.openSettings = () => {
  const wps=['wp-0','wp-1','wp-2','wp-3','wp-4','wp-5'];
  const wpLabels=['ミッドナイト','ディープパープル','オーシャン','クリムゾン','フォレスト','サンセット'];
  const curWP=UH.ls.get('wallpaper','wp-0');
  const html = `
    <div style="display:flex;height:100%;background:#1c1c1e">
      <!-- Sidebar -->
      <div style="width:200px;border-right:1px solid rgba(255,255,255,0.06);padding:8px">
        ${[['🎨','外観'],['🖥','ディスプレイ'],['👤','ユーザー'],['🔔','通知'],['ℹ️','UtiloHubについて']].map(([ic,lb],i)=>`
        <div onclick="stTab(${i})" id="st-tab-${i}" class="file-item ${i===0?'selected':''}" style="border-radius:8px;padding:8px 12px;font-size:13px;margin-bottom:2px;cursor:pointer;display:flex;align-items:center;gap:10px;color:rgba(255,255,255,0.8)">
          <span style="font-size:18px">${ic}</span>${lb}
        </div>`).join('')}
      </div>
      <!-- Content -->
      <div id="st-content" style="flex:1;overflow-y:auto;padding:20px">
        <div id="st-p-0">
          <div style="font-size:20px;font-weight:600;color:white;margin-bottom:16px">外観</div>
          <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">壁紙</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${wps.map((wp,i)=>`<div id="wp-sel-${i}" onclick="stSetWP('${wp}',${i})" style="height:70px;border-radius:10px;cursor:pointer;border:3px solid ${curWP===wp?'#0071e3':'transparent'};overflow:hidden;transition:all 0.2s" class="${wp}">
              <div style="height:100%;display:flex;align-items:flex-end;padding:6px;font-size:11px;color:rgba(255,255,255,0.6);background:linear-gradient(to top,rgba(0,0,0,0.3),transparent)">${wpLabels[i]}</div>
            </div>`).join('')}
          </div>
        </div>
        <div id="st-p-1" style="display:none">
          <div style="font-size:20px;font-weight:600;color:white;margin-bottom:16px">ディスプレイ</div>
          <div style="color:rgba(255,255,255,0.5);font-size:14px">解像度: ${screen.width} × ${screen.height}</div>
        </div>
        <div id="st-p-2" style="display:none">
          <div style="font-size:20px;font-weight:600;color:white;margin-bottom:16px">ユーザー</div>
          <div style="color:rgba(255,255,255,0.5);font-size:14px">ユーザー名: ${UH.ls.get('setup_name','ゲスト')}</div>
        </div>
        <div id="st-p-3" style="display:none">
          <div style="font-size:20px;font-weight:600;color:white;margin-bottom:16px">通知</div>
          <div style="color:rgba(255,255,255,0.5);font-size:14px">通知はオンです</div>
        </div>
        <div id="st-p-4" style="display:none">
          <div style="font-size:20px;font-weight:600;color:white;margin-bottom:16px">UtiloHubについて</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.4);line-height:2">
            <div>バージョン: <b style="color:white">2.1</b></div>
            <div>作者: <b style="color:white">KanoraStudio</b></div>
            <div>技術: <b style="color:white">Vanilla JS + Firebase</b></div>
            <div style="margin-top:12px"><a href="https://github.com/KanoraStudio/UtiloHub" target="_blank" style="color:#0071e3">GitHubで見る →</a></div>
          </div>
        </div>
      </div>
    </div>`;
  UH.open('settings','設定','⚙️',html,600,440);
  window.stTab=i=>{
    for(let j=0;j<5;j++){document.getElementById('st-p-'+j).style.display=j===i?'':'none';const t=document.getElementById('st-tab-'+j);if(t)t.className='file-item'+(j===i?' selected':'');}
  };
  window.stSetWP=(wp,i)=>{
    document.getElementById('wallpaper').className=wp;
    UH.ls.set('wallpaper',wp);
    document.querySelectorAll('[id^=wp-sel-]').forEach((el,j)=>el.style.borderColor=j===i?'#0071e3':'transparent');
    UH.notify('壁紙を変更しました','','🎨','#0071e3');
  };
};

// ── File Manager ──
window.openFiles = () => {
  const notes=UH.ls.get('notes2',[]);
  const tasks=UH.ls.get('tasks',[]);
  const items=[
    {name:'アプリ',icon:'📁',type:'folder',size:'—'},
    {name:'メモ ('+notes.length+'件)',icon:'📁',type:'folder',size:'—'},
    {name:'タスク ('+tasks.length+'件)',icon:'📁',type:'folder',size:'—'},
    ...notes.map(n=>({name:(n.title||'無題')+'.txt',icon:'📄',type:'file',size:(n.body||'').length+' B'})),
  ];
  const html=`
    <div style="display:flex;flex-direction:column;height:100%;background:#1c1c1e">
      <div style="padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <span style="font-size:12px;color:rgba(255,255,255,0.35)">📁 UtiloHub</span>
        <div style="flex:1"></div>
        <input class="app-input" style="width:160px;padding:5px 10px;font-size:12px" placeholder="🔍 検索..." oninput="flSearch(this.value)">
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:0;padding:6px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05)">
        <span>名前</span><span>種類</span><span>サイズ</span>
      </div>
      <div id="fl-list" style="flex:1;overflow-y:auto;padding:4px 8px"></div>
    </div>`;
  UH.open('files','ファイル','📁',html,420,380);
  const render=(list=items)=>{
    const el=document.getElementById('fl-list');if(!el)return;
    el.innerHTML=list.map(f=>`
      <div class="file-item" style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:8px 10px;border-radius:8px;align-items:center">
        <span style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.8)">${f.icon} ${f.name}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.35)">${f.type==='folder'?'フォルダ':'テキスト'}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.35)">${f.size}</span>
      </div>`).join('');
  };
  window.flSearch=q=>render(items.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())));
  setTimeout(()=>render(),50);
};
