// ===== UtiloHub — Windows VM (XP/Vista風) =====

window.openWinVM = function() {
  var win = document.getElementById('win-vm');
  if(!win) return;
  win.style.display = 'flex';
  winInitDesktop();
};

window.closeWinVM = function() {
  var win = document.getElementById('win-vm');
  if(win) win.style.display = 'none';
};

// ─── State ───
var _winWindows  = {};
var _winZ        = 10;
var _winStartOpen = false;

// ─── Init Desktop ───
window.winInitDesktop = function() {
  renderWinTaskbar();
  renderWinDesktopIcons();
  setInterval(function(){
    var c = document.getElementById('win-clock');
    if(c) {
      var n = new Date();
      c.innerHTML = n.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}) +
        '<br><span style="font-size:10px">' + n.toLocaleDateString('ja-JP',{month:'2-digit',day:'2-digit'}) + '</span>';
    }
  }, 1000);
};

// ─── Desktop Icons ───
var _winIcons = [
  {id:'mypc',    icon:'🖥',  label:'マイ\nコンピュータ', fn:'winOpenMyPC'},
  {id:'docs',    icon:'📁',  label:'マイ\nドキュメント',  fn:'winOpenDocs'},
  {id:'ie',      icon:'🌐',  label:'Internet\nExplorer',   fn:'winOpenIE'},
  {id:'notepad', icon:'📄',  label:'メモ帳',              fn:'winOpenNotepad'},
  {id:'paint',   icon:'🎨',  label:'ペイント',             fn:'winOpenPaint'},
  {id:'calc',    icon:'🧮',  label:'電卓',                fn:'winOpenCalc'},
  {id:'cmd',     icon:'🖤',  label:'コマンド\nプロンプト', fn:'winOpenCmd'},
  {id:'trash',   icon:'🗑',  label:'ごみ箱',              fn:'winOpenTrash'},
];

window.renderWinDesktopIcons = function() {
  var area = document.getElementById('win-icon-area');
  if(!area) return;
  area.innerHTML = '';
  _winIcons.forEach(function(ic) {
    var d = document.createElement('div');
    d.className = 'win-desk-icon';
    d.id = 'wi-' + ic.id;
    d.innerHTML = '<div class="win-desk-icon-img">' + ic.icon + '</div><div class="win-desk-icon-label">' + ic.label + '</div>';
    d.ondblclick = function() { if(window[ic.fn]) window[ic.fn](); };
    d.onclick = function() {
      document.querySelectorAll('.win-desk-icon').forEach(function(x){ x.classList.remove('selected'); });
      d.classList.add('selected');
    };
    area.appendChild(d);
  });
};

// ─── Taskbar ───
window.renderWinTaskbar = function() {
  // taskbar is static HTML; only update buttons
  _updateTaskbarBtns();
};

window._updateTaskbarBtns = function() {
  var bar = document.getElementById('win-taskbar-btns');
  if(!bar) return;
  bar.innerHTML = '';
  Object.values(_winWindows).forEach(function(w) {
    var btn = document.createElement('button');
    btn.className = 'win-taskbar-btn' + (w.focused ? ' active' : '');
    btn.innerHTML = w.icon + ' ' + w.title;
    btn.onclick = function() {
      if(w.minimized) { winRestoreW(w.id); } else if(w.focused) { winMinimizeW(w.id); } else { winFocusW(w.id); }
    };
    bar.appendChild(btn);
  });
};

// ─── Window Manager ───
window.winCreateWindow = function(id, title, icon, bodyHTML, w, h) {
  if(_winWindows[id]) { winFocusW(id); return; }
  var area = document.getElementById('win-desktop-area');
  if(!area) return;

  var count = Object.keys(_winWindows).length;
  var x = 60 + count * 24;
  var y = 40 + count * 24;

  var el = document.createElement('div');
  el.className = 'win-window';
  el.id = 'ww-' + id;
  el.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;z-index:'+(++_winZ);
  el.innerHTML =
    '<div class="win-titlebar" id="wtb-'+id+'">' +
      '<div class="win-tb-left"><span class="win-tb-icon">'+icon+'</span><span class="win-tb-title">'+title+'</span></div>' +
      '<div class="win-tb-btns">' +
        '<button class="win-tb-btn min" onclick="winMinimizeW(\''+id+'\')" title="最小化">_</button>' +
        '<button class="win-tb-btn max" onclick="winToggleMaxW(\''+id+'\')" title="最大化">□</button>' +
        '<button class="win-tb-btn cls" onclick="winCloseW(\''+id+'\')" title="閉じる">✕</button>' +
      '</div>' +
    '</div>' +
    '<div class="win-menubar" id="wmb-'+id+'"></div>' +
    '<div class="win-body" id="wb-'+id+'">'+bodyHTML+'</div>' +
    '<div class="win-statusbar" id="wst-'+id+'">準備完了</div>';

  area.appendChild(el);
  _winWindows[id] = { id:id, title:title, icon:icon, w:w, h:h, x:x, y:y, minimized:false, maximized:false, focused:true };
  winFocusW(id);
  _makeDraggableWin(id);
  _updateTaskbarBtns();
};

window.winCloseW = function(id) {
  var el = document.getElementById('ww-'+id);
  if(el) {
    el.style.transition = 'transform .15s,opacity .15s';
    el.style.transform = 'scale(0.9)';
    el.style.opacity = '0';
    setTimeout(function(){ el.remove(); }, 150);
  }
  delete _winWindows[id];
  _updateTaskbarBtns();
};

window.winMinimizeW = function(id) {
  var el = document.getElementById('ww-'+id);
  var w  = _winWindows[id];
  if(!el || !w) return;
  el.style.display = 'none';
  w.minimized = true; w.focused = false;
  _updateTaskbarBtns();
};

window.winRestoreW = function(id) {
  var el = document.getElementById('ww-'+id);
  var w  = _winWindows[id];
  if(!el || !w) return;
  el.style.display = 'flex';
  w.minimized = false;
  winFocusW(id);
};

window.winToggleMaxW = function(id) {
  var el = document.getElementById('ww-'+id);
  var w  = _winWindows[id];
  if(!el || !w) return;
  if(w.maximized) {
    el.style.cssText = 'left:'+w.sx+'px;top:'+w.sy+'px;width:'+w.w+'px;height:'+w.h+'px;z-index:'+(++_winZ)+';display:flex;flex-direction:column';
    w.maximized = false;
  } else {
    w.sx = el.offsetLeft; w.sy = el.offsetTop;
    el.style.cssText = 'left:0;top:0;width:100%;height:calc(100% - 0px);z-index:'+(++_winZ)+';display:flex;flex-direction:column;border-radius:0';
    w.maximized = true;
  }
  winFocusW(id);
};

window.winFocusW = function(id) {
  Object.keys(_winWindows).forEach(function(k){ _winWindows[k].focused = false; });
  if(_winWindows[id]) { _winWindows[id].focused = true; }
  document.querySelectorAll('.win-window').forEach(function(el){ el.classList.remove('focused'); });
  var el = document.getElementById('ww-'+id);
  if(el) { el.classList.add('focused'); el.style.zIndex = ++_winZ; }
  _updateTaskbarBtns();
};

window._makeDraggableWin = function(id) {
  var tb  = document.getElementById('wtb-'+id);
  var win = document.getElementById('ww-'+id);
  if(!tb || !win) return;
  var dragging = false, ox = 0, oy = 0;
  tb.onmousedown = function(e) {
    if(e.target.classList.contains('win-tb-btn')) return;
    dragging = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop;
    winFocusW(id);
  };
  document.addEventListener('mousemove', function(e){ if(!dragging)return; win.style.left=Math.max(0,e.clientX-ox)+'px'; win.style.top=Math.max(0,e.clientY-oy)+'px'; });
  document.addEventListener('mouseup',   function(){ dragging=false; });
  win.onmousedown = function(){ winFocusW(id); };
};

// ─── Start Menu ───
window.winToggleStart = function() {
  _winStartOpen = !_winStartOpen;
  var sm = document.getElementById('win-start-menu');
  if(sm) sm.style.display = _winStartOpen ? 'flex' : 'none';
};
document.addEventListener('click', function(e) {
  if(_winStartOpen && !e.target.closest('#win-start-menu') && !e.target.closest('#win-start-btn')) {
    _winStartOpen = false;
    var sm = document.getElementById('win-start-menu');
    if(sm) sm.style.display = 'none';
  }
});

// ─── Apps ───

// My PC
window.winOpenMyPC = function() {
  var html = '<div class="win-explorer"><div class="win-exp-sidebar"><div class="win-exp-section">システムタスク</div><div class="win-exp-link" onclick="winOpenDocs()">📁 マイドキュメント</div><div class="win-exp-link">📀 ローカルディスク (C:)</div><div class="win-exp-link">📀 ローカルディスク (D:)</div><div class="win-exp-section" style="margin-top:12px">その他の場所</div><div class="win-exp-link">🖥 デスクトップ</div><div class="win-exp-link">🔌 ネットワーク</div></div><div class="win-exp-main"><div class="win-exp-header">ハードディスクドライブ</div><div style="display:flex;flex-wrap:wrap;gap:12px;padding:8px"><div class="win-file-item" ondblclick="alert(\'Cドライブ\\n容量: 80GB\\n空き: 62GB\')"><div class="win-fi-icon">💿</div><div class="win-fi-name">ローカルディスク (C:)</div><div class="win-fi-info">62.3 GB 空き / 80 GB</div></div><div class="win-file-item" ondblclick="alert(\'Dドライブ\\n容量: 40GB\\n空き: 35GB\')"><div class="win-fi-icon">💿</div><div class="win-fi-name">ローカルディスク (D:)</div><div class="win-fi-info">35.1 GB 空き / 40 GB</div></div></div><div class="win-exp-header">デバイス（リムーバブル記憶域）</div><div style="display:flex;flex-wrap:wrap;gap:12px;padding:8px"><div class="win-file-item" ondblclick="alert(\'DVD ドライブ\\nディスクがありません\')"><div class="win-fi-icon">💿</div><div class="win-fi-name">DVD ドライブ (E:)</div><div class="win-fi-info">ディスクなし</div></div></div></div></div>';
  winCreateWindow('mypc','マイコンピュータ','🖥',html,620,440);
  setWinMenu('mypc',['ファイル','編集','表示','お気に入り','ツール','ヘルプ']);
};

// My Docs
window.winOpenDocs = function() {
  var notes = JSON.parse(localStorage.getItem('uh2_notes2')||'[]');
  var items = notes.map(function(n,i){
    return '<div class="win-file-item" ondblclick="winEditDoc('+i+')"><div class="win-fi-icon">📄</div><div class="win-fi-name">'+(n.title||'無題')+'.txt</div><div class="win-fi-info">'+(n.body||'').length+' bytes</div></div>';
  }).join('');
  if(!items) items = '<div style="padding:20px;color:#666;font-size:13px">ドキュメントがありません</div>';
  var html = '<div class="win-explorer"><div class="win-exp-sidebar"><div class="win-exp-section">ファイルと\nフォルダのタスク</div><div class="win-exp-link" onclick="winNewDoc()">📄 新しいファイル</div><div class="win-exp-link">📧 このファイルを電子メール</div><div class="win-exp-link">🖨 印刷</div><div class="win-exp-section" style="margin-top:12px">その他の場所</div><div class="win-exp-link" onclick="winOpenMyPC()">🖥 マイコンピュータ</div><div class="win-exp-link">🖥 デスクトップ</div></div><div class="win-exp-main"><div class="win-exp-header">マイドキュメント</div><div style="display:flex;flex-wrap:wrap;gap:8px;padding:8px">'+items+'</div></div></div>';
  winCreateWindow('docs','マイドキュメント','📁',html,620,440);
  setWinMenu('docs',['ファイル','編集','表示','お気に入り','ツール','ヘルプ']);
};

window.winNewDoc = function() { winOpenNotepad(); };
window.winEditDoc = function(i) { winOpenNotepad(); };

// Internet Explorer
window.winOpenIE = function() {
  var html = '<div style="display:flex;flex-direction:column;height:100%;background:#fff"><div style="background:linear-gradient(to bottom,#e8e8e8,#d0d0d0);padding:4px 6px;display:flex;align-items:center;gap:4px;border-bottom:1px solid #aaa"><button class="win-ie-btn" onclick="document.getElementById(\'ie-frame\').contentWindow.history.back()">◀</button><button class="win-ie-btn" onclick="document.getElementById(\'ie-frame\').contentWindow.history.forward()">▶</button><button class="win-ie-btn" onclick="document.getElementById(\'ie-frame\').contentWindow.location.reload()">↺</button><button class="win-ie-btn" onclick="document.getElementById(\'ie-frame\').src=\'about:blank\'">🏠</button><div style="flex:1;display:flex;align-items:center;background:white;border:2px inset #aaa;padding:2px 8px;margin:0 4px"><span style="font-size:11px;color:#666">アドレス: </span><input id="ie-url" style="flex:1;border:none;outline:none;font-size:12px;font-family:Arial" value="about:blank" onkeydown="if(event.key===\'Enter\')ieGo(this.value)"></div><button class="win-ie-btn" onclick="ieGo(document.getElementById(\'ie-url\').value)" style="padding:2px 12px">移動</button></div><div style="background:#f0f0f0;padding:2px 8px;font-size:11px;color:#555;border-bottom:1px solid #ccc;display:flex;gap:12px"><span style="cursor:pointer;color:#00008B" onclick="ieGo(\'https://www.msn.com\')">MSN</span><span style="cursor:pointer;color:#00008B" onclick="ieGo(\'https://www.google.com/webhp?igu=1\')">Google</span><span style="cursor:pointer;color:#00008B" onclick="ieGo(\'https://ja.wikipedia.org\')">Wikipedia</span></div><iframe id="ie-frame" style="flex:1;border:none;background:#fff" src="about:blank"></iframe><div style="background:linear-gradient(to bottom,#d0d0d0,#b8b8b8);padding:2px 8px;font-size:11px;color:#444;display:flex;justify-content:space-between;border-top:1px solid #aaa"><span id="ie-status">完了</span><span>インターネット | 保護モード: オフ</span></div></div>';
  winCreateWindow('ie','Internet Explorer','🌐',html,780,520);
  setWinMenu('ie',['ファイル','編集','表示','お気に入り','ツール','ヘルプ']);
  window.ieGo = function(url) {
    if(!url.trim()) return;
    if(!url.startsWith('http')) url = url.includes('.')&&!url.includes(' ') ? 'https://'+url : 'https://www.google.com/search?q='+encodeURIComponent(url);
    document.getElementById('ie-frame').src = url;
    document.getElementById('ie-url').value = url;
    document.getElementById('ie-status').textContent = 'ページを読み込んでいます...';
    document.getElementById('ie-frame').onload = function(){ document.getElementById('ie-status').textContent = '完了'; };
  };
};

// Notepad
window.winOpenNotepad = function() {
  var html = '<div style="display:flex;flex-direction:column;height:100%;background:#fff"><textarea id="win-np-area" style="flex:1;border:none;outline:none;resize:none;font-family:\'Courier New\',monospace;font-size:13px;padding:4px;line-height:1.5;color:#000;background:#fff" placeholder="ここに入力してください..."></textarea></div>';
  winCreateWindow('notepad','メモ帳 - 無題','📄',html,500,380);
  setWinMenu('notepad',[
    {label:'ファイル', items:['新規(N)','開く(O)...','上書き保存(S)','名前を付けて保存(A)...','---','印刷(P)...','---','メモ帳の終了(X)']},
    {label:'編集',     items:['元に戻す(U)','---','切り取り(T)','コピー(C)','貼り付け(P)','削除(D)','---','すべて選択(A)','日付と時刻(D)']},
    {label:'書式',     items:['右端で折り返す(W)','フォント(F)...']},
    {label:'表示',     items:['ステータス バー(S)']},
    {label:'ヘルプ',   items:['ヘルプ トピック(H)','---','バージョン情報(A)...']},
  ]);
};

// Paint (XP style)
window.winOpenPaint = function() {
  var colors = ['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff8040','#804000','#80ff00','#004040','#0080ff','#8000ff','#ff0080','#ff8080'];
  var palette = colors.map(function(c){return '<div onclick="window._wpColor=\''+c+'\'" style="width:16px;height:16px;background:'+c+';cursor:pointer;border:1px solid #808080;box-sizing:border-box" title="'+c+'"></div>';}).join('');
  var html = '<div style="display:flex;flex-direction:column;height:100%;background:#c0c0c0"><div style="display:flex;height:calc(100% - 28px)"><div style="width:28px;background:#c0c0c0;border-right:1px solid #808080;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 2px"><button class="win-tool-btn" title="鉛筆" onclick="window._wpTool=\'pen\';window._wpErase=false" style="font-size:14px">✏️</button><button class="win-tool-btn" title="消しゴム" onclick="window._wpTool=\'eraser\';window._wpErase=true" style="font-size:14px">📤</button><button class="win-tool-btn" title="塗りつぶし" onclick="window._wpTool=\'fill\'" style="font-size:14px">🪣</button><button class="win-tool-btn" title="直線" onclick="window._wpTool=\'line\'" style="font-size:14px">╱</button><button class="win-tool-btn" title="四角形" onclick="window._wpTool=\'rect\'" style="font-size:14px">⬜</button><button class="win-tool-btn" title="テキスト" onclick="window._wpTool=\'text\'" style="font-size:14px">A</button></div><div style="flex:1;overflow:hidden;background:#808080;display:flex;align-items:center;justify-content:center"><canvas id="win-paint-cv" width="600" height="400" style="background:white;cursor:crosshair;display:block"></canvas></div></div><div style="height:28px;display:flex;align-items:center;gap:2px;padding:0 4px;border-top:1px solid #808080;background:#c0c0c0"><div style="width:24px;height:24px;border:2px inset #808080;margin-right:4px" id="win-color-preview" style="background:#000000"></div><input type="range" id="win-brush-size" min="1" max="30" value="3" style="width:60px;accent-color:#0078d4"><div style="display:flex;flex-wrap:wrap;width:384px;gap:1px">'+palette+'</div><button onclick="var a=document.createElement(\'a\');a.href=document.getElementById(\'win-paint-cv\').toDataURL();a.download=\'drawing.bmp\';a.click()" style="margin-left:auto;font-size:11px;padding:2px 8px;border:2px outset #fff;background:#c0c0c0;cursor:pointer">保存</button><button onclick="var cv=document.getElementById(\'win-paint-cv\');cv.getContext(\'2d\').fillStyle=\'white\';cv.getContext(\'2d\').fillRect(0,0,cv.width,cv.height)" style="font-size:11px;padding:2px 8px;border:2px outset #fff;background:#c0c0c0;cursor:pointer;margin-left:4px">全消し</button></div></div>';
  winCreateWindow('paint','ペイント','🎨',html,680,480);
  setWinMenu('paint',['ファイル','編集','表示','イメージ','色','ヘルプ']);
  setTimeout(function(){
    var cv=document.getElementById('win-paint-cv');if(!cv)return;
    var cx=cv.getContext('2d');
    window._wpColor='#000000'; window._wpTool='pen'; window._wpErase=false;
    var drawing=false,lx=0,ly=0,sx=0,sy=0,snap=null;
    cv.onmousedown=function(e){drawing=true;lx=e.offsetX;ly=e.offsetY;sx=e.offsetX;sy=e.offsetY;if(window._wpTool==='pen'||window._wpTool==='eraser'){cx.beginPath();cx.moveTo(lx,ly);}if(window._wpTool!=='line'&&window._wpTool!=='rect')snap=null;else{snap=cx.getImageData(0,0,cv.width,cv.height);}};
    cv.onmousemove=function(e){if(!drawing)return;var s=parseInt(document.getElementById('win-brush-size').value)||3;if(window._wpTool==='pen'||window._wpTool==='eraser'){cx.lineWidth=s;cx.strokeStyle=window._wpErase?'white':window._wpColor;cx.lineCap='round';cx.lineTo(e.offsetX,e.offsetY);cx.stroke();}else if(window._wpTool==='line'&&snap){cx.putImageData(snap,0,0);cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(e.offsetX,e.offsetY);cx.strokeStyle=window._wpColor;cx.lineWidth=s;cx.stroke();}else if(window._wpTool==='rect'&&snap){cx.putImageData(snap,0,0);cx.strokeStyle=window._wpColor;cx.lineWidth=s;cx.strokeRect(sx,sy,e.offsetX-sx,e.offsetY-sy);}};
    cv.onmouseup=function(){drawing=false;snap=null;cx.closePath();};
  },80);
};

// Calculator (Win XP style)
window.winOpenCalc = function() {
  var html = '<div style="background:#c0c0c0;padding:8px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:4px"><div id="wc-disp" style="background:white;border:2px inset #808080;padding:4px 8px;text-align:right;font-size:22px;font-family:\'Courier New\',monospace;min-height:36px;color:#000">0</div><div id="wc-hist" style="background:#e8e8e8;border:1px inset #aaa;padding:2px 8px;font-size:11px;color:#666;min-height:16px;font-family:\'Courier New\',monospace"></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px;margin-top:4px"><button class="win-calc-btn" onclick="wcKey(\'MC\')">MC</button><button class="win-calc-btn" onclick="wcKey(\'MR\')">MR</button><button class="win-calc-btn" onclick="wcKey(\'MS\')">MS</button><button class="win-calc-btn" onclick="wcKey(\'M+\')">M+</button><button class="win-calc-btn" onclick="wcKey(\'M-\')">M-</button><button class="win-calc-btn red" onclick="wcKey(\'←\')">←</button><button class="win-calc-btn red" onclick="wcKey(\'CE\')">CE</button><button class="win-calc-btn red" onclick="wcKey(\'C\')">C</button><button class="win-calc-btn red" onclick="wcKey(\'+/-\')">+/-</button><button class="win-calc-btn red" onclick="wcKey(\'√\')">√</button><button class="win-calc-btn" onclick="wcKey(\'7\')">7</button><button class="win-calc-btn" onclick="wcKey(\'8\')">8</button><button class="win-calc-btn" onclick="wcKey(\'9\')">9</button><button class="win-calc-btn" onclick="wcKey(\'DEL\')" style="text-decoration:line-through;font-size:11px">DEL</button><button class="win-calc-btn blue" onclick="wcKey(\'/\')">÷</button><button class="win-calc-btn" onclick="wcKey(\'4\')">4</button><button class="win-calc-btn" onclick="wcKey(\'5\')">5</button><button class="win-calc-btn" onclick="wcKey(\'6\')">6</button><button class="win-calc-btn" onclick="wcKey(\'×\')">×</button><button class="win-calc-btn blue" onclick="wcKey(\'%\')">%</button><button class="win-calc-btn" onclick="wcKey(\'1\')">1</button><button class="win-calc-btn" onclick="wcKey(\'2\')">2</button><button class="win-calc-btn" onclick="wcKey(\'3\')">3</button><button class="win-calc-btn" onclick="wcKey(\'-\')">-</button><button class="win-calc-btn blue" onclick="wcKey(\'1/x\')">1/x</button><button class="win-calc-btn" style="grid-column:span 2" onclick="wcKey(\'0\')">0</button><button class="win-calc-btn" onclick="wcKey(\'.\')">.</button><button class="win-calc-btn" onclick="wcKey(\'+\')">+</button><button class="win-calc-btn blue" onclick="wcKey(\'=\')" style="background:#1a6fc4;color:white">=</button></div></div>';
  winCreateWindow('calc','電卓','🧮',html,280,340);
  setWinMenu('calc',[{label:'表示',items:['標準電卓(T)','関数電卓(S)','---','数字のグループ化(I)']},{label:'編集',items:['コピー(C)','貼り付け(P)']},{label:'ヘルプ',items:['ヘルプ トピック(H)','---','バージョン情報(A)...']}]);
  var disp='0',prev=null,op=null,rst=false,mem=0;
  window.wcKey=function(k){
    var d=document.getElementById('wc-disp'),h=document.getElementById('wc-hist');if(!d)return;
    if(k==='C'){disp='0';prev=null;op=null;rst=false;if(h)h.textContent='';}
    else if(k==='CE'){disp='0';}
    else if(k==='←'){disp=disp.length>1?disp.slice(0,-1):'0';}
    else if(k==='+/-'){disp=String(-parseFloat(disp)||0);}
    else if(k==='√'){disp=String(Math.sqrt(parseFloat(disp)));if(h)h.textContent='sqrt('+disp+')';}
    else if(k==='1/x'){disp=String(1/parseFloat(disp));}
    else if(k==='%'){disp=String(parseFloat(disp)/100);}
    else if(k==='MC'){mem=0;}else if(k==='MR'){disp=String(mem);}else if(k==='MS'){mem=parseFloat(disp);}else if(k==='M+'){mem+=parseFloat(disp);}else if(k==='M-'){mem-=parseFloat(disp);}
    else if(['/','×','-','+'].includes(k)){prev=parseFloat(disp);op=k;rst=true;if(h)h.textContent=disp+' '+k;}
    else if(k==='='){if(prev===null||!op)return;var c=parseFloat(disp),ops={'÷':(a,b)=>b?a/b:'Err','×':(a,b)=>a*b,'-':(a,b)=>a-b,'+':(a,b)=>a+b,'/':(a,b)=>b?a/b:'Err'};var r=ops[op]?.(prev,c);if(h)h.textContent=prev+' '+op+' '+c+' =';if(typeof r==='number')r=parseFloat(r.toPrecision(12));disp=String(r??'Error');prev=null;op=null;rst=true;}
    else if(k==='.'){if(!disp.includes('.')){disp+='.';}}
    else{if(rst){disp=k;rst=false;}else disp=disp==='0'?k:disp+k;}
    d.textContent=disp;
  };
};

// Command Prompt
window.winOpenCmd = function() {
  var html = '<div style="background:#000;color:#c0c0c0;font-family:\'Courier New\',monospace;font-size:13px;display:flex;flex-direction:column;height:100%;padding:0"><div id="win-cmd-out" style="flex:1;overflow-y:auto;padding:8px;white-space:pre-wrap;word-break:break-all"></div><div style="display:flex;align-items:center;padding:0 8px 8px;gap:4px"><span id="win-cmd-prompt" style="color:#c0c0c0;white-space:nowrap">C:\\Users\\ゲスト></span><input id="win-cmd-in" style="flex:1;background:transparent;border:none;outline:none;color:#c0c0c0;font-family:\'Courier New\',monospace;font-size:13px;caret-color:#c0c0c0" onkeydown="winCmdKey(event)"></div></div>';
  winCreateWindow('cmd','コマンド プロンプト','🖤',html,600,380);
  setWinMenu('cmd',[{label:'ファイル',items:['新しいタブ(T)','プロパティ(P)','閉じる(C)']},{label:'編集',items:['マーク(K)','コピー(Y)','貼り付け(P)','すべて選択(A)','スクロール(L)']},{label:'表示',items:['全画面表示(F5)']},{label:'ヘルプ',items:['バージョン情報(A)...']}]);
  var out=document.getElementById('win-cmd-out');
  var print=function(txt,col){var d=document.createElement('div');d.style.color=col||'#c0c0c0';d.textContent=txt;out.appendChild(d);out.scrollTop=out.scrollHeight;};
  print('Microsoft Windows XP [Version 5.1.2600]');print('(C) Copyright 1985-2001 Microsoft Corp.');print('');
  var hist=[],hi=0,cwd='C:\\Users\\ゲスト';
  var cmds={
    help:function(){['dir','cd','cls','echo','ver','date','time','ipconfig','systeminfo','tree','color','exit','start','tasklist','type','mkdir','rmdir'].forEach(function(c){print('  '+c);});},
    ver:function(){print('Microsoft Windows XP [Version 5.1.2600]');},
    cls:function(){out.innerHTML='';},
    date:function(){print('現在の日付: '+new Date().toLocaleDateString('ja-JP'));},
    time:function(){print('現在の時刻: '+new Date().toLocaleTimeString('ja-JP'));},
    exit:function(){winCloseW('cmd');},
    ipconfig:function(){print('Windows IP 設定\n\nイーサネット アダプタ ローカル エリア接続:\n   接続固有の DNS サフィックス . . . :\n   IP アドレス . . . . . . . . . . . : 192.168.1.100\n   サブネット マスク . . . . . . . . : 255.255.255.0\n   デフォルト ゲートウェイ . . . . . : 192.168.1.1');},
    systeminfo:function(){print('ホスト名: UTILOHUB-PC\nOS 名: Microsoft Windows XP Professional\nOS バージョン: 5.1.2600 Service Pack 3\n製造元: UtiloHub Virtual\nプロセッサ: x86 Family 6, ~2000 MHz\n物理メモリの合計: 1,024 MB\n利用可能な物理メモリ: 512 MB');},
    tasklist:function(){print('イメージ名        PID  セッション名  メモリ使用量\n========== ====== ============ ============\nSystem           4  Console       256 K\nexplorer.exe   832  Console    28,540 K\niexplore.exe  1024  Console    45,200 K\nnotepad.exe   1200  Console     5,332 K\ncmd.exe       1400  Console     4,096 K');},
    color:function(){print('COLORコマンド: 色を変更します（0=黒, A=緑, F=白）');},
    tree:function(){print('フォルダー パスの一覧: C:\\Users\\ゲスト\n└─デスクトップ\n└─ドキュメント\n  └─メモ.txt\n└─ダウンロード\n└─ミュージック\n└─ピクチャ');},
  };
  window.winCmdKey=function(e){
    var inp=document.getElementById('win-cmd-in');if(!e||!inp)return;
    if(e.key==='Enter'){
      var raw=inp.value.trim();
      print(cwd+'>'+raw,'#c0c0c0');
      hist.unshift(raw);hi=0;
      if(!raw){inp.value='';return;}
      var parts=raw.toLowerCase().split(' ');
      if(parts[0]==='echo'){print(raw.substring(5)||'');}
      else if(parts[0]==='cd'){if(parts[1]){cwd=parts[1]==='..'?cwd.split('\\').slice(0,-1).join('\\')||'C:':cwd+'\\'+parts[1];document.getElementById('win-cmd-prompt').textContent=cwd+'>';}else{print(cwd);}}
      else if(parts[0]==='dir'){print(' ドライブ C のボリューム ラベルがありません\n ボリューム シリアル番号は 1234-ABCD です\n\n C:\\Users\\ゲスト のディレクトリ\n\n2024/01/01  09:00    <DIR>          .\n2024/01/01  09:00    <DIR>          ..\n2024/01/01  10:00    <DIR>          デスクトップ\n2024/01/01  10:00    <DIR>          ドキュメント\n               0 個のファイル              0 バイト\n               4 個のディレクトリ  62,345,678,912 バイトの空き領域');}
      else if(parts[0]==='mkdir'||parts[0]==='md'){print(parts[1]?'ディレクトリが作成されました: '+parts[1]:'コマンドの構文が正しくありません。');}
      else if(parts[0]==='start'){if(parts[1]==='notepad'||parts[1]==='notepad.exe'){winOpenNotepad();}else if(parts[1]==='calc'||parts[1]==='calc.exe'){winOpenCalc();}else if(parts[1]==='paint'||parts[1]==='mspaint.exe'){winOpenPaint();}else{print('\''+parts[1]+'\' は、内部コマンドまたは外部コマンド、'+'\n操作可能なプログラムまたはバッチ ファイルとして認識されていません。','#ff4444');}}
      else if(cmds[parts[0]]){cmds[parts[0]]();}
      else{print('\''+parts[0]+'\' は、内部コマンドまたは外部コマンド、\n操作可能なプログラムまたはバッチ ファイルとして認識されていません。','#ff4444');}
      inp.value='';
    }else if(e.key==='ArrowUp'){if(hi<hist.length)inp.value=hist[hi++];}
    else if(e.key==='ArrowDown'){hi=Math.max(0,hi-1);inp.value=hist[hi]||'';}
  };
  setTimeout(function(){document.getElementById('win-cmd-in')?.focus();},100);
};

// Recycle Bin
window.winOpenTrash = function() {
  var html = '<div class="win-explorer"><div class="win-exp-sidebar"><div class="win-exp-section">ごみ箱のタスク</div><div class="win-exp-link" onclick="alert(\'ごみ箱を空にしました\')">🗑 ごみ箱を空にする</div><div class="win-exp-link">↩ 全ての項目を元に戻す</div><div class="win-exp-section" style="margin-top:12px">その他の場所</div><div class="win-exp-link" onclick="winOpenDocs()">📁 マイドキュメント</div><div class="win-exp-link" onclick="winOpenMyPC()">🖥 マイコンピュータ</div></div><div class="win-exp-main"><div class="win-exp-header">ごみ箱</div><div style="padding:40px;text-align:center;color:#666;font-size:13px">ごみ箱は空です</div></div></div>';
  winCreateWindow('trash','ごみ箱','🗑',html,560,400);
  setWinMenu('trash',['ファイル','編集','表示','お気に入り','ツール','ヘルプ']);
};

// ─── Menu bar helper ───
window.setWinMenu = function(id, items) {
  var bar = document.getElementById('wmb-'+id);
  if(!bar) return;
  bar.innerHTML = '';
  items.forEach(function(item) {
    var label = typeof item === 'string' ? item : item.label;
    var subItems = typeof item === 'object' ? item.items : null;
    var span = document.createElement('span');
    span.className = 'win-menu-item';
    span.textContent = label;
    if(subItems) {
      span.onclick = function(e) {
        e.stopPropagation();
        document.querySelectorAll('.win-dropdown').forEach(function(d){ d.remove(); });
        var dd = document.createElement('div');
        dd.className = 'win-dropdown';
        dd.style.cssText = 'position:absolute;background:#f0f0f0;border:1px solid #aaa;box-shadow:2px 2px 4px rgba(0,0,0,.3);z-index:99999;min-width:160px;padding:2px 0;font-size:12px;font-family:\'Segoe UI\',Tahoma,sans-serif';
        var rect = span.getBoundingClientRect();
        var area = document.getElementById('win-desktop-area');
        var ar   = area ? area.getBoundingClientRect() : {left:0,top:0};
        dd.style.left = (rect.left - ar.left) + 'px';
        dd.style.top  = (rect.bottom - ar.top) + 'px';
        subItems.forEach(function(si) {
          if(si === '---') {
            var sep = document.createElement('div');
            sep.style.cssText = 'height:1px;background:#aaa;margin:2px 0';
            dd.appendChild(sep);
          } else {
            var di = document.createElement('div');
            di.style.cssText = 'padding:4px 20px;cursor:pointer;color:#000';
            di.textContent = si;
            di.onmouseover = function(){ di.style.background='#316ac5';di.style.color='white'; };
            di.onmouseout  = function(){ di.style.background='';di.style.color='#000'; };
            di.onclick = function(){ dd.remove(); };
            dd.appendChild(di);
          }
        });
        var wbody = document.getElementById('wb-'+id);
        if(wbody) wbody.style.position='relative';
        var warea = document.getElementById('ww-'+id);
        if(warea){ warea.style.overflow='visible'; warea.appendChild(dd); }
        document.addEventListener('click', function h(){ dd.remove(); document.removeEventListener('click',h); }, {once:true});
      };
    }
    bar.appendChild(span);
  });
};
