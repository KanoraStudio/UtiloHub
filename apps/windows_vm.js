// ===================================================================
//  UtiloHub — Custom Windows XP Environment  (完全リライト版)
//  © KanoraStudio — Ultra-High Quality Custom Windows Simulator
// ===================================================================

'use strict';

// ── グローバル状態 ──
var _W = {
  wins: {},           // 開いているウィンドウ
  z: 1000,           // z-index
  startOpen: false,   // スタートメニュー表示状態
  clockIv: null,      // 時計インターバル
  built: false,       // DOM構築済みフラグ
  activeId: null,     // フォーカス中ウィンドウ
  ctx: {},            // アプリ状態(電卓メモリなど)
};

// ================================================================
//  エントリポイント
// ================================================================
window.launchWindowsVM = function() {
  if (!_W.built) { _W_buildDOM(); _W.built = true; }
  var vm = document.getElementById('wos-root');
  if (!vm) { console.error('[WOS] root not found'); return; }

  // リセット
  _W.wins = {}; _W.z = 1000; _W.startOpen = false; _W.activeId = null;
  if (_W.clockIv) { clearInterval(_W.clockIv); _W.clockIv = null; }
  document.getElementById('wos-warea').innerHTML = '';
  document.getElementById('wos-taskbtns').innerHTML = '';
  _W_setStartClosed();

  // ユーザー情報
  var nm = localStorage.getItem('uh2_setup_name') || 'ゲスト';
  var av = localStorage.getItem('uh2_setup_av') || '👤';
  var elNm = document.getElementById('wsm-username'); if(elNm) elNm.textContent = nm;
  var elAv = document.getElementById('wsm-avatar');   if(elAv) elAv.textContent = av;

  // 表示
  vm.style.display = 'flex';
  vm.style.opacity = '0';
  vm.style.transition = 'opacity .35s';
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { vm.style.opacity = '1'; });
  });

  _W_startClock();
  _W_renderDesktopIcons();
  _W_desktopContextMenu();
};

window.closeWindowsVM = function() {
  var vm = document.getElementById('wos-root');
  if (!vm) return;
  vm.style.transition = 'opacity .3s';
  vm.style.opacity = '0';
  setTimeout(function() {
    vm.style.display = 'none';
    if (_W.clockIv) { clearInterval(_W.clockIv); _W.clockIv = null; }
    _W.wins = {}; _W.built = false;
    vm.remove();
  }, 320);
};

// ================================================================
//  DOM 構築
// ================================================================
function _W_buildDOM() {
  var root = document.createElement('div');
  root.id = 'wos-root';
  root.style.cssText = [
    'position:fixed;inset:0;z-index:50000;display:none;flex-direction:column',
    'font-family:"Tahoma","Segoe UI",Arial,sans-serif;font-size:13px;user-select:none',
  ].join(';');

  root.innerHTML = _W_desktopHTML() + _W_taskbarHTML() + _W_startMenuHTML() + _W_contextMenuHTML();
  document.body.appendChild(root);

  // デスクトップクリックでスタートを閉じる
  document.getElementById('wos-desktop').addEventListener('click', function() {
    _W_closeStart();
    document.querySelectorAll('.wos-ctxmenu').forEach(function(m) { m.remove(); });
  });
}

function _W_desktopHTML() {
  return [
    '<div id="wos-desktop" style="',
      'flex:1;position:relative;overflow:hidden;',
      'background:linear-gradient(160deg,#1e5fa8 0%,#2b7dd4 30%,#4fa0e0 60%,#6cb8f0 80%,#88ccff 100%)',
    '">',
      // Bliss丘
      '<div style="',
        'position:absolute;bottom:0;left:-5%;right:-5%;height:45%;',
        'background:linear-gradient(180deg,#5ecb2c 0%,#4ab820 40%,#3a9a18 100%);',
        'border-radius:70% 70% 0 0 / 120px 120px 0 0;',
        'box-shadow:0 -8px 40px rgba(0,80,0,.25)',
      '"></div>',
      // 太陽光グレア
      '<div style="',
        'position:absolute;top:-60px;right:80px;width:200px;height:200px;',
        'background:radial-gradient(circle,rgba(255,255,220,.25) 0%,transparent 70%);',
        'pointer-events:none',
      '"></div>',
      // アイコンエリア
      '<div id="wos-icons" style="position:absolute;top:10px;left:10px;display:flex;flex-direction:column;gap:4px;z-index:10"></div>',
      // ウィンドウエリア
      '<div id="wos-warea" style="position:absolute;inset:0;overflow:hidden"></div>',
    '</div>',
  ].join('');
}

function _W_taskbarHTML() {
  return [
    '<div id="wos-taskbar" style="',
      'height:38px;display:flex;align-items:stretch;flex-shrink:0;position:relative;z-index:9000;',
      'background:linear-gradient(180deg,#2b5ecc 0%,#1a45a8 48%,#1e50bf 49%,#2d6de0 100%);',
      'border-top:1px solid rgba(255,255,255,.2);',
      'box-shadow:0 -2px 8px rgba(0,0,30,.4)',
    '">',
      // スタートボタン
      '<button id="wos-startbtn" onclick="wToggleStart()" style="',
        'height:100%;padding:0 14px 0 10px;',
        'background:linear-gradient(180deg,#62c840 0%,#4ab828 45%,#3ca020 46%,#58c038 100%);',
        'border:none;border-right:1px solid rgba(0,0,0,.2);',
        'color:white;font-size:15px;font-weight:900;cursor:pointer;',
        'font-family:"Franklin Gothic Medium","Arial Narrow",Arial,sans-serif;',
        'display:flex;align-items:center;gap:7px;',
        'text-shadow:1px 1px 3px rgba(0,0,0,.6);',
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.3),3px 0 6px rgba(0,0,0,.3);',
        'border-radius:0 14px 14px 0;',
        'transition:filter .1s;',
      '" onmouseover="this.style.filter=\'brightness(1.1)\'" onmouseout="this.style.filter=\'\'">',
        _W_winLogoSVG(18),
        '<span>スタート</span>',
      '</button>',
      // タスクボタンエリア
      '<div id="wos-taskbtns" style="flex:1;display:flex;align-items:center;gap:3px;padding:0 4px;overflow:hidden"></div>',
      // システムトレイ
      '<div style="',
        'display:flex;align-items:center;gap:8px;padding:0 10px;',
        'background:linear-gradient(180deg,#1640a8,#0e3090);',
        'border-left:1px solid rgba(255,255,255,.12);',
        'min-width:80px',
      '">',
        '<span style="font-size:15px;cursor:pointer;opacity:.85" title="音量">🔊</span>',
        '<span style="font-size:15px;cursor:pointer;opacity:.85" title="ネットワーク">🌐</span>',
        '<div id="wos-clock" style="',
          'text-align:center;font-size:11px;color:rgba(255,255,255,.92);',
          'cursor:pointer;line-height:1.5;min-width:52px',
        '"></div>',
      '</div>',
    '</div>',
  ].join('');
}

function _W_startMenuHTML() {
  var apps = [
    { icon: '🌐', label: 'Internet Explorer', sub: 'Webブラウザ',     fn: 'wOpen_ie' },
    { icon: '📄', label: 'メモ帳',             sub: 'テキストエディタ', fn: 'wOpen_notepad' },
    { icon: '🎨', label: 'ペイント',           sub: '画像エディタ',    fn: 'wOpen_paint' },
    { icon: '🧮', label: '電卓',               sub: 'calc.exe',       fn: 'wOpen_calc' },
    { icon: '🖤', label: 'コマンドプロンプト', sub: 'cmd.exe',        fn: 'wOpen_cmd' },
    { icon: '🎵', label: 'メディアプレイヤー', sub: 'wmplayer.exe',   fn: 'wOpen_media' },
    { icon: '📁', label: 'エクスプローラー',   sub: 'マイコンピュータ', fn: 'wOpen_explorer' },
  ];
  var right = [
    { icon: '📁', label: 'マイドキュメント',  fn: 'wOpen_docs' },
    { icon: '🖼', label: 'マイピクチャ',     fn: 'wOpen_pics' },
    { icon: '🎵', label: 'マイミュージック', fn: 'wOpen_music' },
    { icon: '🖥', label: 'マイコンピュータ', fn: 'wOpen_explorer' },
    { icon: '⚙️', label: 'コントロールパネル', fn: 'wOpen_control' },
    { icon: '🔍', label: '検索',             fn: 'wOpen_search' },
    { icon: '❓', label: 'ヘルプとサポート', fn: 'wOpen_help' },
  ];
  var appItems = apps.map(function(a) {
    return [
      '<div class="wsm-item" onclick="wToggleStart();'+a.fn+'()" style="',
        'display:flex;align-items:center;gap:10px;padding:6px 12px;cursor:pointer',
      '">',
        '<span style="font-size:24px;flex-shrink:0;width:28px;text-align:center">'+a.icon+'</span>',
        '<div>',
          '<div style="font-size:12px;font-weight:600;color:#000">'+a.label+'</div>',
          '<div style="font-size:10px;color:#666">'+a.sub+'</div>',
        '</div>',
      '</div>',
    ].join('');
  }).join('');
  var rightItems = right.map(function(a) {
    return [
      '<div class="wsm-ritem" onclick="wToggleStart();'+a.fn+'()" style="',
        'display:flex;align-items:center;gap:8px;padding:5px 14px;cursor:pointer',
      '">',
        '<span style="font-size:17px;width:22px;text-align:center">'+a.icon+'</span>',
        '<span style="font-size:12px;color:#000">'+a.label+'</span>',
      '</div>',
    ].join('');
  }).join('');

  return [
    '<div id="wos-startmenu" style="',
      'display:none;position:absolute;bottom:38px;left:0;z-index:9999;',
      'width:400px;border-radius:10px 10px 0 0;overflow:hidden;',
      'box-shadow:4px -4px 20px rgba(0,0,0,.55);',
      'border:1px solid #0040b8;border-bottom:none;',
    '">',
      // ヘッダー
      '<div style="',
        'background:linear-gradient(90deg,#2458cc,#1840a8);',
        'padding:10px 16px;display:flex;align-items:center;gap:12px',
      '">',
        '<div id="wsm-avatar" style="',
          'width:46px;height:46px;border-radius:6px;font-size:28px;',
          'background:linear-gradient(135deg,#667eea,#764ba2);',
          'display:flex;align-items:center;justify-content:center;',
          'border:2px solid rgba(255,255,255,.4)',
        '">😊</div>',
        '<div id="wsm-username" style="font-size:15px;font-weight:700;color:white;text-shadow:1px 1px 3px rgba(0,0,0,.6)">ゲスト</div>',
      '</div>',
      // 本体
      '<div style="display:flex;min-height:280px;background:#fff">',
        // 左: よく使うアプリ
        '<div style="flex:1;border-right:1px solid #ddd;padding:4px 0">',
          appItems,
          '<div style="height:1px;background:#ddd;margin:4px 8px"></div>',
          '<div class="wsm-item" style="display:flex;align-items:center;gap:10px;padding:6px 12px;cursor:default;opacity:.5">',
            '<span style="font-size:22px;flex-shrink:0;width:28px;text-align:center">⋯</span>',
            '<div style="font-size:12px;font-weight:600">すべてのプログラム ▶</div>',
          '</div>',
        '</div>',
        // 右: 場所
        '<div style="flex:1;background:#dce8fc;padding:4px 0">',
          '<div style="font-size:10px;font-weight:700;color:#1848b0;padding:8px 14px 4px;text-transform:uppercase;letter-spacing:.5px">マイ プレイス</div>',
          rightItems,
        '</div>',
      '</div>',
      // フッター
      '<div style="',
        'background:linear-gradient(180deg,#2458cc,#1440a0);',
        'display:flex;justify-content:flex-end;gap:6px;padding:6px 10px',
      '">',
        '<button onclick="wToggleStart();alert(\'ログオフしますか？\')" style="'+_W_smBtnStyle()+'">🔄 ログオフ(L)</button>',
        '<button onclick="closeWindowsVM()" style="'+_W_smBtnStyle('#c00','#800')+'">⏻ 電源を切る(U)</button>',
      '</div>',
    '</div>',
    // スタイル
    '<style>',
      '.wsm-item:hover{background:#316ac5!important}.wsm-item:hover *{color:white!important}',
      '.wsm-ritem:hover{background:#316ac5!important}.wsm-ritem:hover *{color:white!important}',
    '</style>',
  ].join('');
}

function _W_contextMenuHTML() {
  return '<div id="wos-ctx" class="wos-ctxmenu" style="display:none;position:fixed;z-index:99000;background:#f0f0f0;border:1px solid #808080;box-shadow:3px 3px 8px rgba(0,0,0,.35);min-width:160px;padding:2px 0;font-size:12px;font-family:Tahoma,sans-serif"></div>';
}

function _W_smBtnStyle(bg, shadow) {
  bg = bg || '#1a5fd0'; shadow = shadow || '#0a3090';
  return [
    'background:linear-gradient(180deg,'+bg+','+shadow+');',
    'border:1px solid rgba(255,255,255,.25);color:white;',
    'padding:4px 16px;border-radius:4px;cursor:pointer;',
    'font-family:Tahoma,sans-serif;font-size:12px;',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.2);',
    'transition:filter .1s',
  ].join('');
}

function _W_winLogoSVG(size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 88 88">' +
    '<rect x="2" y="2" width="38" height="38" rx="4" fill="#F25022"/>' +
    '<rect x="48" y="2" width="38" height="38" rx="4" fill="#7FBA00"/>' +
    '<rect x="2" y="48" width="38" height="38" rx="4" fill="#00A4EF"/>' +
    '<rect x="48" y="48" width="38" height="38" rx="4" fill="#FFB900"/>' +
    '</svg>';
}

// ================================================================
//  デスクトップアイコン
// ================================================================
function _W_renderDesktopIcons() {
  var area = document.getElementById('wos-icons');
  if (!area) return;
  var icons = [
    { icon: '🖥', label: 'マイコンピュータ',  fn: 'wOpen_explorer' },
    { icon: '📁', label: 'マイドキュメント',  fn: 'wOpen_docs' },
    { icon: '🌐', label: 'Internet Explorer', fn: 'wOpen_ie' },
    { icon: '🗑', label: 'ごみ箱',            fn: '' },
    { icon: '🎨', label: 'ペイント',           fn: 'wOpen_paint' },
    { icon: '🧮', label: '電卓',               fn: 'wOpen_calc' },
  ];
  area.innerHTML = icons.map(function(ic) {
    return [
      '<div ondblclick="'+(ic.fn?ic.fn+'()':'')+';" style="',
        'display:flex;flex-direction:column;align-items:center;gap:3px;',
        'width:72px;padding:6px 4px;border-radius:5px;cursor:pointer;',
        'transition:background .1s',
      '" onmouseover="this.style.background=\'rgba(60,120,200,.4)\'"',
         ' onmouseout="this.style.background=\'\'">',
        '<span style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">'+ic.icon+'</span>',
        '<span style="',
          'font-size:11px;color:white;text-align:center;line-height:1.3;',
          'text-shadow:1px 1px 2px rgba(0,0,0,.8),0 0 6px rgba(0,0,0,.6);',
          'word-break:break-all',
        '">'+ic.label+'</span>',
      '</div>',
    ].join('');
  }).join('');
}

// ================================================================
//  右クリックメニュー(デスクトップ)
// ================================================================
function _W_desktopContextMenu() {
  var desktop = document.getElementById('wos-desktop');
  if (!desktop) return;
  desktop.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    _W_showCtx(e.clientX, e.clientY, [
      { label: '表示(V) ▶', fn: null },
      { label: '整理(R) ▶', fn: null },
      '---',
      { label: '新しいフォルダー(W)', fn: function() { alert('フォルダー機能は準備中です'); } },
      '---',
      { label: 'プロパティ(R)', fn: function() { wOpen_sysprop(); } },
      { label: 'デスクトップのカスタマイズ...', fn: function() { wOpen_control(); } },
    ]);
  });
}

function _W_showCtx(x, y, items) {
  document.querySelectorAll('.wos-ctxmenu').forEach(function(m) { m.remove(); });
  var menu = document.createElement('div');
  menu.className = 'wos-ctxmenu';
  menu.style.cssText = [
    'position:fixed;left:'+x+'px;top:'+y+'px;z-index:99000;',
    'background:#f0f0f0;border:1px solid #808080;',
    'box-shadow:3px 3px 8px rgba(0,0,0,.35);',
    'min-width:160px;padding:2px 0;',
    'font-size:12px;font-family:Tahoma,sans-serif',
  ].join('');
  items.forEach(function(item) {
    if (item === '---') {
      var sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:#aaa;margin:3px 0';
      menu.appendChild(sep);
      return;
    }
    var el = document.createElement('div');
    el.style.cssText = 'padding:5px 20px;cursor:pointer;color:#000;white-space:nowrap';
    el.textContent = item.label;
    el.addEventListener('mouseover', function() { el.style.background = '#316ac5'; el.style.color = 'white'; });
    el.addEventListener('mouseout',  function() { el.style.background = ''; el.style.color = '#000'; });
    el.addEventListener('click', function() {
      menu.remove();
      if (item.fn) item.fn();
    });
    menu.appendChild(el);
  });
  document.body.appendChild(menu);
  setTimeout(function() {
    document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); }, { once: true });
  }, 0);
}

// ================================================================
//  スタートメニュー
// ================================================================
window.wToggleStart = function() {
  _W.startOpen = !_W.startOpen;
  var sm = document.getElementById('wos-startmenu');
  if (!sm) return;
  if (_W.startOpen) {
    sm.style.display = 'block';
    sm.style.opacity = '0'; sm.style.transform = 'translateY(8px)'; sm.style.transition = 'opacity .18s,transform .18s';
    requestAnimationFrame(function() { sm.style.opacity = '1'; sm.style.transform = 'translateY(0)'; });
  } else {
    _W_setStartClosed();
  }
};
function _W_closeStart() {
  _W.startOpen = false;
  _W_setStartClosed();
}
function _W_setStartClosed() {
  var sm = document.getElementById('wos-startmenu');
  if (sm) { sm.style.display = 'none'; }
}

// ================================================================
//  時計
// ================================================================
function _W_startClock() {
  var tick = function() {
    var c = document.getElementById('wos-clock');
    if (!c) return;
    var n = new Date();
    var hm = n.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    var md = n.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
    c.innerHTML = '<div style="font-weight:600">' + hm + '</div><div style="opacity:.7;font-size:10px">' + md + '</div>';
  };
  tick();
  if (_W.clockIv) clearInterval(_W.clockIv);
  _W.clockIv = setInterval(tick, 1000);
}

// ================================================================
//  ウィンドウ管理エンジン
// ================================================================
window._W_create = function(opts) {
  // opts: { id, title, icon, html, w, h, x, y, resizable, menubar }
  var id  = opts.id;
  var w   = opts.w || 640;
  var h   = opts.h || 480;
  var x   = opts.x || Math.max(20, Math.floor((window.innerWidth - w) / 2));
  var y   = opts.y || Math.max(20, Math.floor((window.innerHeight - h) / 2 - 40));

  // 既に開いていたらフォーカスだけ
  if (_W.wins[id]) { _W_focus(id); return; }

  var area = document.getElementById('wos-warea');
  if (!area) return;

  var win = document.createElement('div');
  win.id = 'wwin-' + id;
  win.style.cssText = [
    'position:absolute;',
    'left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;',
    'z-index:'+(++_W.z)+';',
    'display:flex;flex-direction:column;',
    'border-radius:8px 8px 0 0;',
    'border:1px solid rgba(0,40,160,.5);',
    'box-shadow:3px 3px 20px rgba(0,0,0,.55);',
    'overflow:hidden;',
    opts.resizable !== false ? 'min-width:240px;min-height:100px;resize:none;' : '',
    'opacity:0;transform:scale(.96);transition:opacity .15s,transform .15s',
  ].join('');

  win.innerHTML = [
    // タイトルバー
    '<div id="wtb-'+id+'" style="',
      'height:28px;display:flex;align-items:center;padding:0 6px;flex-shrink:0;',
      'background:linear-gradient(180deg,#4d9af4 0%,#1258cc 40%,#1460d8 60%,#2870e8 100%);',
      'cursor:move;user-select:none;',
    '">',
      '<span style="font-size:14px;margin-right:6px">'+opts.icon+'</span>',
      '<span style="',
        'flex:1;font-size:12px;font-weight:700;color:white;',
        'text-shadow:1px 1px 2px rgba(0,0,0,.7);',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
      '">'+opts.title+'</span>',
      // ウィンドウボタン
      '<div style="display:flex;gap:2px;margin-left:4px">',
        _W_winBtn('_W_min(\''+id+'\')', '#2094f0', '#fff', '—', '最小化'),
        _W_winBtn('_W_max(\''+id+'\')', '#2094f0', '#fff', '⬜', '最大化'),
        _W_winBtn('_W_close(\''+id+'\')', '#d42020', '#fff', '✕', '閉じる'),
      '</div>',
    '</div>',
    // メニューバー
    '<div id="wmb-'+id+'" style="',
      'height:22px;display:flex;align-items:center;padding:0 4px;flex-shrink:0;',
      'background:#ece9d8;border-bottom:1px solid #aca899;font-size:12px',
    '"></div>',
    // 本体
    '<div id="wbody-'+id+'" style="flex:1;overflow:auto;background:#fff;position:relative">'+opts.html+'</div>',
    // ステータスバー
    '<div id="wst-'+id+'" style="',
      'height:20px;display:flex;align-items:center;padding:0 8px;flex-shrink:0;',
      'background:linear-gradient(180deg,#ece9d8,#dcd9c8);',
      'border-top:1px solid #aca899;font-size:11px;color:#444',
    '">準備完了</div>',
  ].join('');

  area.appendChild(win);

  // アニメ
  requestAnimationFrame(function() {
    win.style.opacity = '1';
    win.style.transform = 'scale(1)';
  });

  _W.wins[id] = { id: id, title: opts.title, icon: opts.icon, w: w, h: h, x: x, y: y, minimized: false, maximized: false };
  _W_focus(id);
  _W_makeDrag(id);
  _W_makeResize(id);
  _W_refreshTaskbar();

  // リサイズハンドル
  if (opts.resizable !== false) {
    var rh = document.createElement('div');
    rh.style.cssText = 'position:absolute;bottom:20px;right:0;width:12px;height:calc(100% - 48px);cursor:ew-resize;z-index:5';
    win.appendChild(rh);
    _W_makeEdgeResize(id, rh, 'e');

    var rbh = document.createElement('div');
    rbh.style.cssText = 'position:absolute;bottom:20px;right:0;width:14px;height:14px;cursor:se-resize;z-index:6;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.3) 50%)';
    win.appendChild(rbh);
    _W_makeEdgeResize(id, rbh, 'se');
  }
};

function _W_winBtn(onclick, bg, color, txt, title) {
  return [
    '<button onclick="'+onclick+'" title="'+title+'" style="',
      'width:21px;height:21px;border-radius:4px;border:none;',
      'background:'+bg+';color:'+color+';',
      'font-size:11px;font-weight:700;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 1px 2px rgba(0,0,0,.3);',
      'transition:filter .08s',
    '" onmouseover="this.style.filter=\'brightness(1.2)\'" onmouseout="this.style.filter=\'\'">',
      txt,
    '</button>',
  ].join('');
}

window._W_close = function(id) {
  var el = document.getElementById('wwin-' + id);
  if (el) {
    el.style.transition = 'opacity .12s,transform .12s';
    el.style.opacity = '0';
    el.style.transform = 'scale(.94)';
    setTimeout(function() { el.remove(); }, 130);
  }
  delete _W.wins[id];
  _W_refreshTaskbar();
};
window._W_min = function(id) {
  var el = document.getElementById('wwin-' + id);
  var w  = _W.wins[id];
  if (!el || !w) return;
  el.style.transition = 'transform .15s,opacity .15s';
  el.style.transform = 'scale(.85) translateY(30px)';
  el.style.opacity = '0';
  setTimeout(function() {
    el.style.display = 'none';
    el.style.transform = ''; el.style.opacity = ''; el.style.transition = '';
  }, 160);
  w.minimized = true; w.focused = false;
  _W_refreshTaskbar();
};
window._W_max = function(id) {
  var el = document.getElementById('wwin-' + id);
  var w  = _W.wins[id];
  if (!el || !w) return;
  if (w.maximized) {
    el.style.cssText = el._prevStyle || el.style.cssText;
    el.style.borderRadius = '8px 8px 0 0';
    el.style.transition = 'all .15s';
    w.maximized = false;
  } else {
    el._prevStyle = el.style.cssText;
    el.style.cssText = [
      'position:absolute;left:0;top:0;width:100%;height:100%;',
      'z-index:'+(++_W.z)+';',
      'display:flex;flex-direction:column;',
      'border-radius:0;border:none;overflow:hidden;',
      'box-shadow:none;transition:all .15s',
    ].join('');
    w.maximized = true;
  }
  _W_focus(id);
};
function _W_focus(id) {
  Object.keys(_W.wins).forEach(function(k) { _W.wins[k].focused = false; });
  if (_W.wins[id]) { _W.wins[id].focused = true; _W.activeId = id; }
  // タイトルバー色
  document.querySelectorAll('[id^="wtb-"]').forEach(function(tb) {
    tb.style.background = 'linear-gradient(180deg,#9eb8d4,#7898b8)';
  });
  var el = document.getElementById('wwin-' + id);
  if (el) {
    el.style.zIndex = ++_W.z;
    var tb = el.querySelector('[id^="wtb-"]');
    if (tb) tb.style.background = 'linear-gradient(180deg,#4d9af4 0%,#1258cc 40%,#1460d8 60%,#2870e8 100%)';
  }
  _W_refreshTaskbar();
}
function _W_makeDrag(id) {
  var tb  = document.getElementById('wtb-' + id);
  var win = document.getElementById('wwin-' + id);
  if (!tb || !win) return;
  var dragging = false, ox = 0, oy = 0;
  tb.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'BUTTON') return;
    if (_W.wins[id] && _W.wins[id].maximized) return;
    dragging = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop;
    _W_focus(id); e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var nx = Math.max(0, e.clientX - ox);
    var ny = Math.max(0, e.clientY - oy);
    win.style.left = nx + 'px'; win.style.top = ny + 'px';
  });
  document.addEventListener('mouseup', function() { dragging = false; });
  win.addEventListener('mousedown', function() { _W_focus(id); });
}
function _W_makeResize(id) {
  var el = document.getElementById('wwin-' + id);
  if (!el) return;
  var handle = document.createElement('div');
  handle.style.cssText = 'position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:se-resize;z-index:10;background:linear-gradient(135deg,transparent 50%,rgba(120,120,120,.6) 50%)';
  var resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
  handle.addEventListener('mousedown', function(e) {
    resizing = true; sx = e.clientX; sy = e.clientY; sw = el.offsetWidth; sh = el.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener('mousemove', function(e) {
    if (!resizing) return;
    el.style.width  = Math.max(240, sw + e.clientX - sx) + 'px';
    el.style.height = Math.max(100, sh + e.clientY - sy) + 'px';
  });
  document.addEventListener('mouseup', function() { resizing = false; });
  el.appendChild(handle);
}
function _W_makeEdgeResize(id, handle, dir) {
  var el = document.getElementById('wwin-' + id);
  if (!el || !handle) return;
  var resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
  handle.addEventListener('mousedown', function(e) {
    resizing = true; sx = e.clientX; sy = e.clientY; sw = el.offsetWidth; sh = el.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener('mousemove', function(e) {
    if (!resizing) return;
    if (dir === 'e' || dir === 'se') el.style.width  = Math.max(240, sw + e.clientX - sx) + 'px';
    if (dir === 's' || dir === 'se') el.style.height = Math.max(100, sh + e.clientY - sy) + 'px';
  });
  document.addEventListener('mouseup', function() { resizing = false; });
}
function _W_refreshTaskbar() {
  var bar = document.getElementById('wos-taskbtns');
  if (!bar) return;
  bar.innerHTML = '';
  Object.values(_W.wins).forEach(function(w) {
    var btn = document.createElement('button');
    var active = w.focused && !w.minimized;
    btn.style.cssText = [
      'height:28px;padding:0 10px;max-width:160px;',
      'background:linear-gradient(180deg,'+(active?'#1a3a98,#2050c0':'#3060c0,#1a40a0')+');',
      'border:1px solid rgba(255,255,255,.15);',
      active ? 'border-top:2px solid rgba(255,255,255,.2);box-shadow:inset 0 2px 4px rgba(0,0,0,.35);' : 'box-shadow:inset 0 1px 0 rgba(255,255,255,.2);',
      'color:white;font-size:11px;font-family:Tahoma,sans-serif;cursor:pointer;border-radius:3px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
    ].join('');
    btn.textContent = w.icon + ' ' + w.title;
    btn.addEventListener('click', function() {
      if (w.minimized) {
        var el = document.getElementById('wwin-' + w.id);
        if (el) { el.style.display = 'flex'; w.minimized = false; _W_focus(w.id); }
      } else if (w.focused) {
        _W_min(w.id);
      } else {
        _W_focus(w.id);
      }
    });
    bar.appendChild(btn);
  });
}

// ================================================================
//  メニューバーヘルパー
// ================================================================
function _W_setMenu(id, menus) {
  var bar = document.getElementById('wmb-' + id);
  if (!bar) return;
  bar.innerHTML = '';
  menus.forEach(function(m) {
    var label = typeof m === 'string' ? m : m.label;
    var items = m.items || null;
    var span  = document.createElement('span');
    span.style.cssText = 'padding:2px 8px;cursor:pointer;border-radius:3px;color:#000;font-size:12px';
    span.textContent = label;
    span.addEventListener('mouseover', function() { span.style.background='#316ac5'; span.style.color='white'; });
    span.addEventListener('mouseout',  function() { span.style.background=''; span.style.color='#000'; });
    if (items) {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.wos-ctxmenu').forEach(function(d) { d.remove(); });
        var dd = document.createElement('div');
        dd.className = 'wos-ctxmenu';
        var sr = span.getBoundingClientRect();
        dd.style.cssText = [
          'position:fixed;left:'+sr.left+'px;top:'+sr.bottom+'px;z-index:99000;',
          'background:#f0f0f0;border:1px solid #808080;',
          'box-shadow:3px 3px 8px rgba(0,0,0,.3);',
          'min-width:180px;padding:2px 0;font-size:12px;font-family:Tahoma,sans-serif',
        ].join('');
        items.forEach(function(si) {
          if (si === '---') { var sep=document.createElement('div'); sep.style.cssText='height:1px;background:#aca899;margin:3px 0'; dd.appendChild(sep); return; }
          var di = document.createElement('div');
          di.style.cssText = 'padding:4px 20px;cursor:pointer;color:#000;white-space:nowrap';
          di.textContent = typeof si === 'string' ? si : si.label;
          di.addEventListener('mouseover', function() { di.style.background='#316ac5'; di.style.color='white'; });
          di.addEventListener('mouseout',  function() { di.style.background=''; di.style.color='#000'; });
          di.addEventListener('click', function() {
            dd.remove();
            if (si.fn) { if (typeof si.fn === 'function') si.fn(); else if (window[si.fn]) window[si.fn](id); }
          });
          dd.appendChild(di);
        });
        document.body.appendChild(dd);
        setTimeout(function() { document.addEventListener('click', function h() { dd.remove(); document.removeEventListener('click', h); }, { once: true }); }, 0);
      });
    }
    bar.appendChild(span);
  });
}

// ================================================================
//  ── アプリ: Internet Explorer ──
// ================================================================
window.wOpen_ie = function() {
  var html = [
    '<div style="display:flex;flex-direction:column;height:100%">',
      // ツールバー
      '<div style="background:linear-gradient(180deg,#eee,#d4d0c8);padding:3px 4px;display:flex;align-items:center;gap:3px;border-bottom:1px solid #aca899;flex-shrink:0">',
        _W_ieBtn('◀', 'document.getElementById(\'wos-ie-f\').contentWindow.history.back()'),
        _W_ieBtn('▶', 'document.getElementById(\'wos-ie-f\').contentWindow.history.forward()'),
        _W_ieBtn('↺', 'document.getElementById(\'wos-ie-f\').contentWindow.location.reload()'),
        _W_ieBtn('🏠', 'wIeNav(\'https://www.msn.com\')'),
        '<span style="font-size:11px;color:#444;margin-left:6px">アドレス(D):</span>',
        '<input id="wos-ie-u" placeholder="URLまたはキーワード" onkeydown="if(event.key===\'Enter\')wIeNav(this.value)" style="',
          'flex:1;margin:0 4px;padding:2px 8px;border:2px inset #aaa;font-size:12px;font-family:Arial;outline:none',
        '">',
        '<button onclick="wIeNav(document.getElementById(\'wos-ie-u\').value)" style="',
          'background:linear-gradient(180deg,#f0f0f0,#d0d0d0);border:2px outset #ddd;padding:2px 12px;font-size:12px;cursor:pointer;border-radius:2px',
        '">移動(G)</button>',
      '</div>',
      // リンクバー
      '<div style="background:#d4e0f4;padding:2px 8px;font-size:11px;border-bottom:1px solid #b0c0d8;display:flex;align-items:center;gap:12px;flex-shrink:0">',
        '<span style="color:#555;font-size:10px">リンク(L):</span>',
        ['MSN','Google','Yahoo! JAPAN','Wikipedia','YouTube'].map(function(s, i) {
          var urls = ['https://www.msn.com','https://www.google.com/webhp?igu=1','https://www.yahoo.co.jp','https://ja.wikipedia.org','https://www.youtube.com'];
          return '<span onclick="wIeNav(\''+urls[i]+'\')" style="color:#00008b;cursor:pointer;text-decoration:underline;font-size:11px">'+s+'</span>';
        }).join(''),
      '</div>',
      '<iframe id="wos-ie-f" style="flex:1;border:none" src="about:blank"></iframe>',
      '<div style="background:linear-gradient(180deg,#d4d0c8,#b8b4a8);padding:2px 8px;font-size:11px;color:#444;display:flex;justify-content:space-between;flex-shrink:0;border-top:1px solid #aca899">',
        '<span id="wos-ie-st">完了</span>',
        '<span>🌐 インターネット | 保護モード: オフ</span>',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'ie', title:'Internet Explorer', icon:'🌐', html:html, w:860, h:580 });
  _W_setMenu('ie', [
    { label:'ファイル', items: ['新しいウィンドウ(N)', '---', '印刷(P)...', '---', { label:'閉じる(C)', fn: function() { _W_close('ie'); } }] },
    { label:'編集',     items: ['切り取り(T)', 'コピー(C)', '貼り付け(P)', '---', 'すべて選択(A)'] },
    { label:'表示',     items: ['更新(R)', '---', 'ソース(C)', '---', 'フルスクリーン'] },
    { label:'お気に入り', items: ['お気に入りに追加(A)...', '---', 'MSN', 'Google', 'Yahoo! JAPAN'] },
    { label:'ツール',   items: ['インターネットオプション(O)...'] },
    { label:'ヘルプ',   items: [{ label:'バージョン情報(A)', fn: function() { alert('Internet Explorer 6.0\nUtiloHub Emulation'); } }] },
  ]);
};
function _W_ieBtn(txt, onclick) {
  return '<button onclick="'+onclick+'" style="background:linear-gradient(180deg,#f0f0f0,#d0d0d0);border:2px outset #ddd;padding:2px 7px;font-size:12px;cursor:pointer;border-radius:2px;min-width:28px;transition:filter .08s" onmouseover="this.style.filter=\'brightness(1.08)\'" onmouseout="this.style.filter=\'\'">'+txt+'</button>';
}
window.wIeNav = function(url) {
  if (!url || !url.trim()) return;
  url = url.trim();
  if (!url.startsWith('http')) {
    url = (url.includes('.') && !url.includes(' '))
      ? 'https://' + url
      : 'https://www.google.com/search?q=' + encodeURIComponent(url);
  }
  var f = document.getElementById('wos-ie-f');
  var u = document.getElementById('wos-ie-u');
  var s = document.getElementById('wos-ie-st');
  if (f) f.src = url;
  if (u) u.value = url;
  if (s) { s.textContent = 'ページを読み込んでいます...'; }
  if (f) f.onload = function() { if (s) s.textContent = '完了'; };
};

// ================================================================
//  ── アプリ: メモ帳 ──
// ================================================================
window.wOpen_notepad = function(filename, content) {
  var fname = filename || '無題';
  var body  = content  || '';
  var uid   = 'np-' + Date.now();
  var html  = [
    '<textarea id="'+uid+'" spellcheck="false" style="',
      'width:100%;height:100%;border:none;outline:none;resize:none;',
      'font-family:"MS ゴシック",Consolas,monospace;font-size:13px;',
      'padding:6px;box-sizing:border-box;background:#fff;color:#000;',
      'line-height:1.6',
    '">'+_W_esc(body)+'</textarea>',
  ].join('');
  _W_create({ id: uid, title: fname + ' - メモ帳', icon: '📄', html: html, w: 580, h: 460 });
  _W_setMenu(uid, [
    { label:'ファイル', items:[
        { label:'新規(N)', fn: function() { wOpen_notepad(); } },
        '---',
        { label:'保存(S)', fn: function() {
            var txt = document.getElementById(uid) ? document.getElementById(uid).value : '';
            var files = JSON.parse(localStorage.getItem('wos_docs') || '[]');
            var name = prompt('ファイル名', fname) || fname;
            var idx = files.findIndex(function(f) { return f.name === name; });
            if (idx >= 0) files[idx].body = txt; else files.push({ name: name, body: txt });
            localStorage.setItem('wos_docs', JSON.stringify(files));
            document.getElementById('wst-'+uid).textContent = name + ' を保存しました';
            fname = name;
          }
        },
        '---',
        { label:'閉じる', fn: function() { _W_close(uid); } },
      ]
    },
    { label:'編集', items:[
        { label:'元に戻す', fn: function() { document.execCommand('undo'); } },
        '---',
        { label:'切り取り', fn: function() { document.execCommand('cut'); } },
        { label:'コピー',   fn: function() { document.execCommand('copy'); } },
        { label:'貼り付け', fn: function() { document.execCommand('paste'); } },
        '---',
        { label:'すべて選択', fn: function() { var t=document.getElementById(uid); if(t){ t.focus(); t.select(); } } },
      ]
    },
    { label:'書式', items:['テキスト折り返し(W)', '---', 'フォント(F)...'] },
    { label:'表示', items:['ステータスバー(S)'] },
    { label:'ヘルプ', items:[{ label:'メモ帳について(A)', fn: function() { alert('メモ帳\nUtiloHub Windows Environment'); } }] },
  ]);
};

// ================================================================
//  ── アプリ: ペイント ──
// ================================================================
window.wOpen_paint = function() {
  var colors = [
    '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
    '#c0c0c0','#ffffff','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
    '#ff8040','#804000','#004040','#0080ff','#8000ff','#ff0080',
  ];
  var tools = [
    { icon:'✏️', id:'pen',     title:'鉛筆' },
    { icon:'🖌', id:'brush',   title:'ブラシ' },
    { icon:'📤', id:'eraser',  title:'消しゴム' },
    { icon:'🪣', id:'fill',    title:'塗りつぶし' },
    { icon:'╱',  id:'line',    title:'直線' },
    { icon:'▭',  id:'rect',    title:'長方形' },
    { icon:'⭕',  id:'ellipse', title:'楕円' },
    { icon:'A',  id:'text',    title:'テキスト' },
  ];
  var palette = colors.map(function(c) {
    return '<div onclick="window._wpC=\''+c+'\';document.getElementById(\'wos-wp-cur\').style.background=\''+c+'\'" title="'+c+'" style="width:20px;height:20px;background:'+c+';cursor:pointer;border:2px outset #fff;box-sizing:border-box"></div>';
  }).join('');
  var toolBtns = tools.map(function(t) {
    return '<button id="wos-wpt-'+t.id+'" onclick="window._wpT=\''+t.id+'\';_W_selectTool(\''+t.id+'\')" title="'+t.title+'" style="width:28px;height:28px;background:linear-gradient(180deg,#f0f0f0,#d8d8d8);border:2px outset #ddd;cursor:pointer;font-size:13px;border-radius:2px;display:flex;align-items:center;justify-content:center;padding:0;margin:1px">'+t.icon+'</button>';
  }).join('');

  var html = [
    '<div style="display:flex;flex-direction:column;height:100%;background:#c0c0c0">',
      // ツールバー
      '<div style="background:#c0c0c0;border-bottom:1px solid #808080;padding:3px 6px;display:flex;align-items:center;gap:6px;flex-shrink:0">',
        '<span style="font-size:11px;color:#000">太さ:</span>',
        '<input type="range" id="wos-wp-sz" min="1" max="40" value="3" style="width:70px">',
        '<span style="font-size:11px;color:#000">色:</span>',
        '<div id="wos-wp-cur" style="width:24px;height:24px;background:#000;border:2px inset #808080"></div>',
        '<div style="height:20px;width:1px;background:#808080;margin:0 4px"></div>',
        '<button onclick="var c=document.getElementById(\'wos-wp-cv\');var cx=c.getContext(\'2d\');cx.fillStyle=\'#fff\';cx.fillRect(0,0,c.width,c.height)" style="font-size:11px;padding:2px 8px;border:2px outset #ddd;background:#c0c0c0;cursor:pointer;border-radius:2px">全消し</button>',
        '<button onclick="var a=document.createElement(\'a\');a.href=document.getElementById(\'wos-wp-cv\').toDataURL(\'image/png\');a.download=\'drawing.png\';a.click()" style="font-size:11px;padding:2px 8px;border:2px outset #ddd;background:#c0c0c0;cursor:pointer;border-radius:2px">💾 PNG保存</button>',
      '</div>',
      '<div style="display:flex;flex:1;overflow:hidden">',
        // ツールボックス
        '<div style="width:36px;background:#c0c0c0;border-right:2px inset #808080;padding:3px;display:flex;flex-direction:column;flex-wrap:wrap;align-content:flex-start;gap:1px;flex-shrink:0">',
          toolBtns,
        '</div>',
        // キャンバスエリア
        '<div style="flex:1;overflow:auto;background:#808080;display:flex;align-items:flex-start;justify-content:flex-start;padding:8px">',
          '<canvas id="wos-wp-cv" width="720" height="500" style="background:white;cursor:crosshair;display:block;box-shadow:2px 2px 6px rgba(0,0,0,.5)"></canvas>',
        '</div>',
      '</div>',
      // パレット
      '<div style="height:30px;display:flex;align-items:center;gap:0;padding:4px 8px;border-top:2px inset #808080;background:#c0c0c0;flex-shrink:0;flex-wrap:wrap">',
        palette,
      '</div>',
    '</div>',
  ].join('');

  _W_create({ id:'paint', title:'ペイント', icon:'🎨', html:html, w:820, h:580 });
  _W_setMenu('paint', [
    { label:'ファイル', items:['新規(N)', '---', { label:'名前を付けて保存(A)...', fn: function() { var a=document.createElement('a'); a.href=document.getElementById('wos-wp-cv').toDataURL(); a.download='drawing.png'; a.click(); } }, '---', { label:'閉じる', fn: function() { _W_close('paint'); } }] },
    { label:'編集',   items:['元に戻す(Z)', '---', 'すべて選択(A)'] },
    { label:'イメージ', items:['左右反転(H)', '上下反転(V)', '---', '拡大縮小(S)...'] },
    { label:'色',     items:[{ label:'色の編集...', fn: function() { var inp=document.createElement('input'); inp.type='color'; inp.oninput=function() { window._wpC=inp.value; var el=document.getElementById('wos-wp-cur'); if(el) el.style.background=inp.value; }; inp.click(); } }] },
    { label:'ヘルプ', items:[{ label:'ペイントについて(A)', fn: function() { alert('ペイント\nUtiloHub Windows Environment'); } }] },
  ]);

  window._wpC = '#000000'; window._wpT = 'pen';

  setTimeout(function() {
    var cv = document.getElementById('wos-wp-cv');
    if (!cv) return;
    var cx = cv.getContext('2d');
    var drawing = false, lx = 0, ly = 0, sx = 0, sy = 0, snap = null;

    cv.addEventListener('mousedown', function(e) {
      drawing = true; lx = e.offsetX; ly = e.offsetY; sx = e.offsetX; sy = e.offsetY;
      var s = parseInt(document.getElementById('wos-wp-sz').value) || 3;
      if (window._wpT === 'pen' || window._wpT === 'brush') { cx.beginPath(); cx.moveTo(lx, ly); }
      if (['line','rect','ellipse'].includes(window._wpT)) { snap = cx.getImageData(0, 0, cv.width, cv.height); }
      if (window._wpT === 'fill') { _W_floodFill(cx, cv, e.offsetX, e.offsetY, window._wpC); drawing = false; }
      if (window._wpT === 'text') {
        var txt = prompt('テキスト入力:'); if (!txt) { drawing = false; return; }
        var fs = Math.max(12, s * 4);
        cx.font = 'bold ' + fs + 'px Arial'; cx.fillStyle = window._wpC; cx.fillText(txt, e.offsetX, e.offsetY); drawing = false;
      }
    });
    cv.addEventListener('mousemove', function(e) {
      if (!drawing) return;
      var s = parseInt(document.getElementById('wos-wp-sz').value) || 3;
      cx.strokeStyle = window._wpC; cx.lineCap = 'round'; cx.lineJoin = 'round';
      if (window._wpT === 'pen') {
        cx.lineWidth = s; cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(e.offsetX, e.offsetY); cx.stroke();
        lx = e.offsetX; ly = e.offsetY;
      } else if (window._wpT === 'brush') {
        cx.lineWidth = s * 2.5; cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(e.offsetX, e.offsetY); cx.stroke();
        lx = e.offsetX; ly = e.offsetY;
      } else if (window._wpT === 'eraser') {
        cx.lineWidth = s * 4; cx.strokeStyle = '#ffffff'; cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(e.offsetX, e.offsetY); cx.stroke();
        lx = e.offsetX; ly = e.offsetY;
      } else if (snap) {
        cx.putImageData(snap, 0, 0);
        cx.lineWidth = s;
        if (window._wpT === 'line')    { cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(e.offsetX, e.offsetY); cx.stroke(); }
        if (window._wpT === 'rect')    { cx.strokeRect(sx, sy, e.offsetX - sx, e.offsetY - sy); }
        if (window._wpT === 'ellipse') { cx.beginPath(); cx.ellipse(sx+(e.offsetX-sx)/2, sy+(e.offsetY-sy)/2, Math.abs(e.offsetX-sx)/2, Math.abs(e.offsetY-sy)/2, 0, 0, Math.PI*2); cx.stroke(); }
      }
    });
    cv.addEventListener('mouseup',    function() { drawing = false; snap = null; cx.beginPath(); });
    cv.addEventListener('mouseleave', function() { drawing = false; snap = null; cx.beginPath(); });
  }, 80);
};

window._W_selectTool = function(toolId) {
  document.querySelectorAll('[id^="wos-wpt-"]').forEach(function(b) { b.style.borderStyle = 'outset'; b.style.background = 'linear-gradient(180deg,#f0f0f0,#d8d8d8)'; });
  var btn = document.getElementById('wos-wpt-' + toolId);
  if (btn) { btn.style.borderStyle = 'inset'; btn.style.background = '#c0c0c0'; }
};

function _W_floodFill(cx, cv, x, y, fillColor) {
  var imgData = cx.getImageData(0, 0, cv.width, cv.height);
  var d = imgData.data, w = cv.width, h = cv.height;
  x = Math.round(x); y = Math.round(y);
  var pos = (y * w + x) * 4;
  var sr = d[pos], sg = d[pos+1], sb = d[pos+2];
  var fc = parseInt(fillColor.replace('#',''), 16);
  var fr = (fc >> 16) & 255, fg = (fc >> 8) & 255, fb = fc & 255;
  if (sr === fr && sg === fg && sb === fb) return;
  var stack = [[x, y]];
  while (stack.length) {
    var p = stack.pop(); var px = p[0], py = p[1];
    if (px < 0 || px >= w || py < 0 || py >= h) continue;
    var i = (py * w + px) * 4;
    if (d[i] !== sr || d[i+1] !== sg || d[i+2] !== sb) continue;
    d[i] = fr; d[i+1] = fg; d[i+2] = fb; d[i+3] = 255;
    stack.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
  }
  cx.putImageData(imgData, 0, 0);
}

// ================================================================
//  ── アプリ: 電卓 ──
// ================================================================
window.wOpen_calc = function() {
  var html = [
    '<div style="background:#d4d0c8;padding:8px;display:flex;flex-direction:column;gap:4px;height:100%;box-sizing:border-box">',
      '<input id="wos-calc-d" readonly style="',
        'width:100%;box-sizing:border-box;',
        'background:#c8e8c0;border:2px inset #808080;',
        'text-align:right;font-size:22px;font-family:\'Consolas\',monospace;',
        'padding:4px 8px;color:#000;letter-spacing:1px',
      '" value="0">',
      // メモリ表示
      '<div style="display:flex;justify-content:space-between;font-size:10px;color:#444;padding:0 4px">',
        '<span id="wos-calc-mem">M = 0</span>',
        '<span id="wos-calc-op"></span>',
      '</div>',
      // ボタングリッド
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;flex:1">',
        _W_calcBtns(),
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'calc', title:'電卓', icon:'🧮', html:html, w:280, h:360, resizable:false });
  _W_setMenu('calc', [
    { label:'表示', items:['標準電卓(T)', '関数電卓(S)'] },
    { label:'ヘルプ', items:[{ label:'電卓について', fn: function() { alert('電卓\nUtiloHub Windows Environment'); } }] },
  ]);
  // 状態
  window._calcVal = '0'; window._calcPrev = null; window._calcOp = null; window._calcNew = true; window._calcMem = 0;
};

function _W_calcBtns() {
  var rows = [
    ['MC','MR','MS','M+','M-'],
    ['←','CE','C','±','√'],
    ['7','8','9','÷','%'],
    ['4','5','6','×','1/x'],
    ['1','2','3','-','='],
    ['0','.','','+',' '],
  ];
  var out = '';
  rows.forEach(function(row) {
    row.forEach(function(k) {
      if (!k) { out += '<div></div>'; return; }
      var isOp = ['÷','×','-','+','=','√','1/x','%'].includes(k);
      var isMem = ['MC','MR','MS','M+','M-'].includes(k);
      var isClear = ['←','CE','C'].includes(k);
      var bg = isOp ? 'linear-gradient(180deg,#d4b896,#b89050)' : isMem ? 'linear-gradient(180deg,#c0d4e8,#9ab0cc)' : isClear ? 'linear-gradient(180deg,#e8c8c0,#c8a090)' : 'linear-gradient(180deg,#e8e4d4,#c8c4b4)';
      out += '<button onclick="wCalcPress(\''+k+'\')" style="',
        out += 'background:'+bg+';border:2px outset #fff;',
        out += 'font-size:13px;font-weight:'+(k==='='?'700':'400')+';',
        out += 'cursor:pointer;border-radius:3px;',
        out += 'box-shadow:0 1px 2px rgba(0,0,0,.3);',
        out += 'transition:filter .05s;',
      out += '" onmouseover="this.style.filter=\'brightness(1.08)\'" onmouseout="this.style.filter=\'\'">'+k+'</button>';
    });
  });
  return out;
}

window.wCalcPress = function(k) {
  var disp = document.getElementById('wos-calc-d');
  var opEl = document.getElementById('wos-calc-op');
  var memEl = document.getElementById('wos-calc-mem');
  if (!disp) return;
  var v = window._calcVal;

  if (k >= '0' && k <= '9') {
    v = (window._calcNew || v === '0') ? k : v + k;
    window._calcNew = false;
  } else if (k === '.') {
    if (window._calcNew) { v = '0.'; window._calcNew = false; }
    else if (!v.includes('.')) v += '.';
  } else if (k === 'C') {
    v = '0'; window._calcPrev = null; window._calcOp = null; window._calcNew = true;
    if (opEl) opEl.textContent = '';
  } else if (k === 'CE') {
    v = '0'; window._calcNew = true;
  } else if (k === '←') {
    v = (v.length > 1 && v !== '0') ? v.slice(0, -1) : '0';
  } else if (k === '±') {
    v = (parseFloat(v) * -1).toString();
  } else if (k === '√') {
    v = Math.sqrt(parseFloat(v)).toString();
    window._calcNew = true;
  } else if (k === '1/x') {
    v = (1 / parseFloat(v)).toString();
    window._calcNew = true;
  } else if (k === '%') {
    v = (parseFloat(v) / 100).toString();
    window._calcNew = true;
  } else if (['+','-','×','÷'].includes(k)) {
    if (window._calcPrev !== null && !window._calcNew) {
      v = _W_calcCompute(parseFloat(window._calcPrev), parseFloat(v), window._calcOp).toString();
    }
    window._calcPrev = v; window._calcOp = k; window._calcNew = true;
    if (opEl) opEl.textContent = v + ' ' + k;
  } else if (k === '=') {
    if (window._calcPrev !== null && window._calcOp) {
      v = _W_calcCompute(parseFloat(window._calcPrev), parseFloat(v), window._calcOp).toString();
      window._calcPrev = null; window._calcOp = null; window._calcNew = true;
      if (opEl) opEl.textContent = '';
    }
  } else if (k === 'MC') { window._calcMem = 0; }
  else if (k === 'MR') { v = window._calcMem.toString(); window._calcNew = true; }
  else if (k === 'MS') { window._calcMem = parseFloat(v); }
  else if (k === 'M+') { window._calcMem += parseFloat(v); }
  else if (k === 'M-') { window._calcMem -= parseFloat(v); }

  // 表示
  if (v.length > 16) v = parseFloat(v).toExponential(8);
  window._calcVal = v;
  disp.value = v;
  if (memEl) memEl.textContent = 'M = ' + window._calcMem;
};
function _W_calcCompute(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b !== 0 ? a / b : 'エラー';
  return b;
}

// ================================================================
//  ── アプリ: コマンドプロンプト ──
// ================================================================
window.wOpen_cmd = function() {
  var html = [
    '<div style="background:#1a1a1a;height:100%;display:flex;flex-direction:column;padding:0">',
      '<div id="wos-cmd-out" style="flex:1;overflow-y:auto;padding:8px;font-family:\'Consolas\',\'Courier New\',monospace;font-size:13px;color:#c8c8c8;line-height:1.6;white-space:pre-wrap"></div>',
      '<div style="display:flex;align-items:center;padding:4px 8px;border-top:1px solid #333;background:#111">',
        '<span id="wos-cmd-prompt" style="color:#4ec994;font-family:Consolas,monospace;font-size:13px;white-space:nowrap">C:\\Users\\ゲスト&gt; </span>',
        '<input id="wos-cmd-in" onkeydown="wCmdKey(event)" style="',
          'flex:1;background:transparent;border:none;outline:none;',
          'color:#fff;font-family:Consolas,monospace;font-size:13px;',
          'caret-color:#fff',
        '">',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'cmd', title:'コマンドプロンプト', icon:'🖤', html:html, w:700, h:420 });
  _W_setMenu('cmd', [
    { label:'編集', items:['すべて選択(A)', '---', 'コピー(C)', '貼り付け(P)'] },
    { label:'プロパティ', items:['フォント(F)...', '色(C)...'] },
  ]);
  setTimeout(function() {
    _W_cmdPrint('Microsoft Windows XP [バージョン 5.1.2600]');
    _W_cmdPrint('(C) Copyright 1985-2001 Microsoft Corp.');
    _W_cmdPrint('');
    _W_cmdPrint('UtiloHub Virtual Command Processor v2.0');
    _W_cmdPrint('');
    var inp = document.getElementById('wos-cmd-in');
    if (inp) inp.focus();
  }, 80);
  window._cmdHistory = []; window._cmdHistIdx = -1;
};

var _CMD_FS = JSON.parse(localStorage.getItem('wos_cmd_fs') || '{"C:":{"Users":{"ゲスト":{"ドキュメント":{},"デスクトップ":{}}},"Windows":{"System32":{}}}}');
var _CMD_CWD = 'C:\\Users\\ゲスト';

function _W_cmdPrint(txt, color) {
  var out = document.getElementById('wos-cmd-out');
  if (!out) return;
  var line = document.createElement('div');
  line.style.cssText = 'font-family:Consolas,monospace;font-size:13px;line-height:1.6;' + (color ? 'color:'+color : 'color:#c8c8c8');
  line.textContent = txt;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

window.wCmdKey = function(e) {
  if (e.key === 'Enter') {
    var inp = document.getElementById('wos-cmd-in');
    if (!inp) return;
    var cmd = inp.value.trim();
    inp.value = '';
    if (cmd) window._cmdHistory.unshift(cmd);
    window._cmdHistIdx = -1;
    _W_cmdPrint('C:\\Users\\ゲスト> ' + cmd, '#aaa');
    _W_cmdExec(cmd);
  } else if (e.key === 'ArrowUp') {
    window._cmdHistIdx = Math.min(window._cmdHistIdx + 1, window._cmdHistory.length - 1);
    var inp2 = document.getElementById('wos-cmd-in');
    if (inp2 && window._cmdHistory[window._cmdHistIdx]) inp2.value = window._cmdHistory[window._cmdHistIdx];
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    window._cmdHistIdx = Math.max(window._cmdHistIdx - 1, -1);
    var inp3 = document.getElementById('wos-cmd-in');
    if (inp3) inp3.value = window._cmdHistIdx >= 0 ? (window._cmdHistory[window._cmdHistIdx] || '') : '';
    e.preventDefault();
  }
};

function _W_cmdExec(raw) {
  if (!raw) return;
  var parts = raw.split(/\s+/);
  var cmd = parts[0].toLowerCase(); var args = parts.slice(1);

  var cmds = {
    'help':  function() { ['dir          ファイル一覧表示', 'cd [dir]     ディレクトリ変更', 'mkdir [name] フォルダ作成', 'echo [text]  テキスト表示', 'cls          画面クリア', 'color        色変更 (例: color 0a)', 'date         日付表示', 'time         時刻表示', 'ver          バージョン表示', 'whoami       ユーザー表示', 'ipconfig     IP設定表示', 'ping [host]  疎通確認', 'systeminfo   システム情報', 'tasklist     タスク一覧', 'shutdown /s  シャットダウン', 'exit         閉じる'].forEach(function(l) { _W_cmdPrint(l); }); },
    'cls':   function() { var o=document.getElementById('wos-cmd-out'); if(o) o.innerHTML=''; },
    'echo':  function() { _W_cmdPrint(args.join(' ') || ''); },
    'ver':   function() { _W_cmdPrint('Microsoft Windows XP [バージョン 5.1.2600]'); _W_cmdPrint('UtiloHub Virtual Environment 2.0'); },
    'date':  function() { _W_cmdPrint('現在の日付: ' + new Date().toLocaleDateString('ja-JP')); },
    'time':  function() { _W_cmdPrint('現在の時刻: ' + new Date().toLocaleTimeString('ja-JP')); },
    'whoami':function() { _W_cmdPrint('UTILOHUB\\' + (localStorage.getItem('uh2_setup_name') || 'ゲスト')); },
    'dir':   function() { _W_cmdPrint(' ドライブ C のボリューム ラベルは UTILOHUB'); _W_cmdPrint(' ディレクトリ: ' + _CMD_CWD); _W_cmdPrint(''); ['.','..','.','ドキュメント','デスクトップ','マイドキュメント'].forEach(function(f, i) { _W_cmdPrint(i<2?'<DIR>    '+f:'              '+f); }); _W_cmdPrint(''); },
    'cd':    function() { if (!args[0]) { _W_cmdPrint(_CMD_CWD); } else if (args[0]==='..') { var parts2=_CMD_CWD.split('\\'); if(parts2.length>1){ parts2.pop(); _CMD_CWD=parts2.join('\\'); _W_updatePrompt(); } } else { _CMD_CWD += '\\' + args[0]; _W_updatePrompt(); } },
    'mkdir': function() { if(!args[0]){ _W_cmdPrint('ディレクトリ名を指定してください'); } else { _W_cmdPrint('ディレクトリ ' + args[0] + ' を作成しました'); } },
    'ipconfig': function() { _W_cmdPrint('Windows IP 構成'); _W_cmdPrint(''); _W_cmdPrint('イーサネット アダプター:'); _W_cmdPrint('   IPv4 アドレス: 192.168.1.100'); _W_cmdPrint('   サブネット マスク: 255.255.255.0'); _W_cmdPrint('   デフォルト ゲートウェイ: 192.168.1.1'); },
    'ping':  function() { var h=args[0]||'localhost'; _W_cmdPrint(''+h+' に ping を送信しています [32バイト]:'); for(var i=0;i<4;i++) _W_cmdPrint(''+h+' からの応答: バイト=32 時間='+(Math.floor(Math.random()*30)+1)+'ms TTL=64'); },
    'systeminfo': function() { _W_cmdPrint('OS 名: Microsoft Windows XP Professional'); _W_cmdPrint('OS バージョン: 5.1.2600 Service Pack 3'); _W_cmdPrint('ホスト名: UTILOHUB-PC'); _W_cmdPrint('ユーザー: '+(localStorage.getItem('uh2_setup_name')||'ゲスト')); _W_cmdPrint('メモリ: 1,024 MB RAM'); _W_cmdPrint('仮想化: UtiloHub VM 2.0'); },
    'tasklist': function() { _W_cmdPrint('イメージ名          PID  メモリ使用量'); _W_cmdPrint('=================== ==== ============'); [['System',4,'240 K'],['explorer.exe',1234,'18,452 K'],['cmd.exe',2048,'2,344 K'],['iexplore.exe',3012,'48,200 K'],['notepad.exe',4096,'4,100 K']].forEach(function(t){ _W_cmdPrint(t[0].padEnd(20)+String(t[1]).padEnd(5)+t[2]); }); },
    'shutdown': function() { if(args[0]==='/s'){ _W_cmdPrint('システムをシャットダウンしています...'); setTimeout(function(){ closeWindowsVM(); }, 2000); } else { _W_cmdPrint('使用方法: shutdown /s'); } },
    'exit':  function() { _W_close('cmd'); },
    'color': function() { var o=document.getElementById('wos-cmd-out'); var code=args[0]||'07'; var fgs={'0':'#000','1':'#000080','2':'#008000','3':'#008080','4':'#800000','5':'#800080','6':'#808000','7':'#c0c0c0','8':'#808080','9':'#0000ff','a':'#00ff00','b':'#00ffff','c':'#ff0000','d':'#ff00ff','e':'#ffff00','f':'#fff'}; var fg=fgs[code[1]]||'#c0c0c0'; if(o){ o.style.color=fg; o.querySelectorAll('div').forEach(function(d){d.style.color=fg;}); } },
  };

  if (cmds[cmd]) {
    cmds[cmd]();
  } else {
    _W_cmdPrint('\''+cmd+'\' は、内部コマンドまたは外部コマンド、', '#ff6060');
    _W_cmdPrint('操作可能なプログラムまたはバッチ ファイルとして認識されていません。', '#ff6060');
  }
  _W_cmdPrint('');
}

function _W_updatePrompt() {
  var el = document.getElementById('wos-cmd-prompt');
  if (el) el.textContent = _CMD_CWD + '> ';
}

// ================================================================
//  ── アプリ: エクスプローラー ──
// ================================================================
window.wOpen_explorer = function() {
  var html = [
    '<div style="display:flex;height:100%;font-size:12px">',
      // サイドバー
      '<div style="width:170px;background:linear-gradient(180deg,#dce8fc,#c4d8f0);border-right:1px solid #aac0dc;padding:6px;flex-shrink:0;overflow-y:auto">',
        _W_expSideSection('システムタスク', [
          {icon:'ℹ️',label:'システム情報',fn:'wOpen_sysprop'},
          {icon:'⚙️',label:'コントロールパネル',fn:'wOpen_control'},
        ]),
        _W_expSideSection('その他の場所', [
          {icon:'📁',label:'マイドキュメント',fn:'wOpen_docs'},
          {icon:'🖥',label:'マイコンピュータ',fn:'wOpen_explorer'},
          {icon:'🌐',label:'ネットワーク',fn:''},
        ]),
        _W_expSideSection('詳細', []),
      '</div>',
      // コンテンツ
      '<div style="flex:1;padding:12px;overflow:auto">',
        '<div style="font-size:11px;font-weight:700;color:#245edb;padding-bottom:8px;border-bottom:1px solid #c0c0c0;margin-bottom:10px">💾 ハードディスク ドライブ</div>',
        '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px">',
          _W_driveCard('💿','ローカルディスク (C:)','80 GB','62.3 GB 空き','wOpen_cdrive'),
          _W_driveCard('💿','ローカルディスク (D:)','40 GB','35.1 GB 空き',''),
        '</div>',
        '<div style="font-size:11px;font-weight:700;color:#245edb;padding-bottom:8px;border-bottom:1px solid #c0c0c0;margin-bottom:10px">📀 リムーバブル ストレージ</div>',
        '<div style="display:flex;flex-wrap:wrap;gap:12px">',
          _W_driveCard('📀','DVD ドライブ (E:)','','ディスクなし',''),
          _W_driveCard('💾','フロッピー (A:)','1.44 MB','',''),
        '</div>',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'explorer', title:'マイ コンピュータ', icon:'🖥', html:html, w:720, h:500 });
  _W_setMenu('explorer', [
    { label:'ファイル', items:['フォルダ(F) ▶', '---', { label:'閉じる', fn: function() { _W_close('explorer'); } }] },
    { label:'編集',   items:['切り取り','コピー','貼り付け','---','すべて選択'] },
    { label:'表示',   items:['アイコン(N)','一覧(L)','詳細(D)','---','更新(F5)'] },
    { label:'お気に入り', items:['お気に入りに追加(A)...'] },
    { label:'ツール', items:['ネットワーク ドライブの割り当て(N)...', 'フォルダ オプション(O)...'] },
    { label:'ヘルプ', items:[{ label:'ヘルプ トピック', fn: function() { wOpen_help(); } }] },
  ]);
};
function _W_expSideSection(title, items) {
  return '<div style="margin-bottom:10px">' +
    '<div style="font-size:10px;font-weight:700;color:#1a4ab0;padding:4px 2px;border-bottom:1px solid #b0c8e8;margin-bottom:4px">'+title+'</div>' +
    items.map(function(i) {
      return '<div '+(i.fn?'onclick="'+i.fn+'()"':'')+' style="display:flex;align-items:center;gap:6px;padding:3px 4px;cursor:'+(i.fn?'pointer':'default')+';font-size:11px;color:#1a4ab0;text-decoration:underline;border-radius:3px" onmouseover="this.style.background=\'rgba(48,100,200,.1)\'" onmouseout="this.style.background=\'\'"><span>'+i.icon+'</span><span>'+i.label+'</span></div>';
    }).join('') +
  '</div>';
}
function _W_driveCard(icon, label, total, free, fn) {
  var pct = total && free ? Math.round((1 - parseFloat(free) / parseFloat(total)) * 100) : 0;
  var barColor = pct > 90 ? '#e00' : pct > 70 ? '#f80' : '#2488d8';
  return '<div '+(fn?'ondblclick="'+fn+'()"':'')+' style="width:150px;border:1px solid #aca899;border-radius:4px;padding:8px;background:white;cursor:'+(fn?'pointer':'default')+';box-shadow:1px 1px 4px rgba(0,0,0,.1);transition:background .1s" onmouseover="this.style.background=\'#e8f0fe\'" onmouseout="this.style.background=\'white\'">'+
    '<div style="font-size:22px;margin-bottom:4px">'+icon+'</div>'+
    '<div style="font-size:11px;font-weight:600;color:#000;margin-bottom:2px">'+label+'</div>'+
    (total ? '<div style="height:8px;background:#eee;border:1px solid #aaa;border-radius:2px;overflow:hidden;margin:4px 0"><div style="height:100%;width:'+pct+'%;background:'+barColor+'"></div></div>' : '') +
    '<div style="font-size:10px;color:#555">'+free+'</div>'+
  '</div>';
}

// ================================================================
//  ── アプリ: ドキュメント ──
// ================================================================
window.wOpen_docs = function() {
  _W_renderDocs();
};
function _W_renderDocs() {
  var files = JSON.parse(localStorage.getItem('wos_docs') || '[]');
  var items = files.length
    ? files.map(function(f, i) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #eee;cursor:pointer" onmouseover="this.style.background=\'#e8f0fe\'" onmouseout="this.style.background=\'\'" ondblclick="wOpen_notepad(\''+_W_esc(f.name)+'\',\''+_W_esc(f.body||'')+'\')">'+
          '<span style="font-size:22px">📄</span>'+
          '<div><div style="font-size:12px;font-weight:600">'+_W_esc(f.name)+'</div><div style="font-size:10px;color:#888">テキストドキュメント</div></div>'+
          '<button onclick="event.stopPropagation();var fs=JSON.parse(localStorage.getItem(\'wos_docs\')||\'[]\');fs.splice('+i+',1);localStorage.setItem(\'wos_docs\',JSON.stringify(fs));_W_renderDocs()" style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;color:#888" title="削除">🗑</button>'+
        '</div>';
      }).join('')
    : '<div style="text-align:center;padding:40px;color:#888;font-size:13px">📂 ファイルがありません<br><small>メモ帳で保存したファイルがここに表示されます</small></div>';

  if (document.getElementById('docs-body')) {
    document.getElementById('docs-body').innerHTML = items;
  } else {
    var html = '<div id="docs-body" style="height:100%;overflow:auto">'+items+'</div>';
    _W_create({ id:'docs', title:'マイ ドキュメント', icon:'📁', html:html, w:580, h:420 });
    _W_setMenu('docs', [
      { label:'ファイル', items:[{ label:'新規メモ帳(N)', fn: function() { wOpen_notepad(); } }, '---', { label:'閉じる', fn: function() { _W_close('docs'); } }] },
      { label:'編集',   items:[{ label:'すべて選択(A)', fn: function() {} }] },
      { label:'表示',   items:['アイコン(N)','一覧(L)','詳細(D)'] },
    ]);
  }
}

// ================================================================
//  ── アプリ: マイピクチャ ──
// ================================================================
window.wOpen_pics = function() {
  var html = '<div style="padding:16px;text-align:center;color:#555;font-size:13px">🖼<br>マイ ピクチャ<br><small>画像はここに表示されます</small></div>';
  _W_create({ id:'pics', title:'マイ ピクチャ', icon:'🖼', html:html, w:500, h:380 });
};
window.wOpen_music = function() {
  var html = '<div style="padding:16px;text-align:center;color:#555;font-size:13px">🎵<br>マイ ミュージック<br><small>音楽ファイルはここに表示されます</small></div>';
  _W_create({ id:'music', title:'マイ ミュージック', icon:'🎵', html:html, w:500, h:380 });
};

// ================================================================
//  ── アプリ: メディアプレイヤー ──
// ================================================================
window.wOpen_media = function() {
  var tracks = [
    { t:'Windows XP 起動音', a:'Microsoft', d:'0:06', url:'' },
    { t:'フォー・シーズンズ 春', a:'ヴィヴァルディ', d:'3:38', url:'' },
    { t:'月の光', a:'ドビュッシー', d:'5:12', url:'' },
    { t:'ノクターン Op.9 No.2', a:'ショパン', d:'4:33', url:'' },
    { t:'アイネ・クライネ・ナハトムジーク', a:'モーツァルト', d:'6:20', url:'' },
  ];
  var list = tracks.map(function(t, i) {
    return '<div id="wmp-tr-'+i+'" onclick="wmpPlay('+i+')" style="display:flex;align-items:center;gap:10px;padding:7px 10px;cursor:pointer;border-bottom:1px solid #2a2a40;transition:background .1s" onmouseover="this.style.background=\'#2a2a4a\'" onmouseout="this.style.background=\'\'">'+
      '<span style="color:#666;font-size:11px;width:20px;text-align:right">'+('0'+(i+1)).slice(-2)+'</span>'+
      '<div style="flex:1"><div style="font-size:13px;color:#eee">'+t.t+'</div><div style="font-size:11px;color:#888">'+t.a+'</div></div>'+
      '<span style="font-size:11px;color:#666">'+t.d+'</span>'+
    '</div>';
  }).join('');
  var html = [
    '<div style="display:flex;flex-direction:column;height:100%;background:#1a1a2e">',
      // ビジュアライザ
      '<div style="height:120px;background:linear-gradient(180deg,#0d0d20,#1a1a3a);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;overflow:hidden">',
        '<canvas id="wmp-viz" width="400" height="120" style="position:absolute;inset:0;width:100%;height:100%"></canvas>',
        '<div style="position:relative;z-index:1;text-align:center">',
          '<div id="wmp-title" style="font-size:14px;font-weight:600;color:#eee;text-shadow:0 0 20px rgba(100,200,255,.8)">▶ 再生待機中</div>',
          '<div id="wmp-artist" style="font-size:11px;color:#888;margin-top:4px"></div>',
        '</div>',
      '</div>',
      // コントロール
      '<div style="background:#111128;padding:10px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">',
        '<button onclick="wmpPrev()" style="'+_W_wmpBtn()+'">⏮</button>',
        '<button id="wmp-playbtn" onclick="wmpToggle()" style="'+_W_wmpBtn('#0050aa')+';width:40px;height:40px;font-size:18px">▶</button>',
        '<button onclick="wmpNext()" style="'+_W_wmpBtn()+'">⏭</button>',
        '<button onclick="wmpStop()" style="'+_W_wmpBtn()+'">⏹</button>',
        '<input type="range" id="wmp-seek" value="0" min="0" max="100" style="flex:1;accent-color:#0078d4">',
        '<span id="wmp-time" style="font-size:11px;color:#888;min-width:50px;text-align:right">0:00</span>',
        '<span style="font-size:16px;color:#888">🔊</span>',
        '<input type="range" id="wmp-vol" value="70" min="0" max="100" style="width:70px;accent-color:#0078d4">',
      '</div>',
      // プレイリスト
      '<div style="flex:1;overflow-y:auto">'+list+'</div>',
    '</div>',
  ].join('');
  _W_create({ id:'media', title:'Windows Media Player', icon:'🎵', html:html, w:560, h:520 });
  _W_setMenu('media', [
    { label:'ファイル', items:['ファイルを開く(O)...', '---', { label:'閉じる', fn: function() { _W_close('media'); } }] },
    { label:'表示',   items:['フルスクリーン(F)','ビジュアル', 'イコライザ(Q)'] },
    { label:'再生',   items:[{ label:'再生/一時停止(P)', fn: function() { wmpToggle(); } }, '---', { label:'停止(S)', fn: function() { wmpStop(); } }] },
  ]);

  window._wmpPlaying = false; window._wmpIdx = -1; window._wmpVizIv = null;
  _W_wmpVizStart();
};

function _W_wmpBtn(bg) {
  return 'background:'+(bg||'#1a1a3a')+';border:1px solid #333;color:#ccc;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:filter .1s';
}

window.wmpPlay = function(idx) {
  window._wmpIdx = idx;
  var tracks = [
    { t:'Windows XP 起動音', a:'Microsoft' },
    { t:'フォー・シーズンズ 春', a:'ヴィヴァルディ' },
    { t:'月の光', a:'ドビュッシー' },
    { t:'ノクターン Op.9 No.2', a:'ショパン' },
    { t:'アイネ・クライネ・ナハトムジーク', a:'モーツァルト' },
  ];
  document.querySelectorAll('[id^="wmp-tr-"]').forEach(function(el) { el.style.background=''; el.style.color=''; });
  var tr = document.getElementById('wmp-tr-' + idx);
  if (tr) tr.style.background = '#1a3a6a';
  var t = tracks[idx] || {};
  var title = document.getElementById('wmp-title');
  var artist = document.getElementById('wmp-artist');
  if (title) title.textContent = '♪ ' + (t.t || '');
  if (artist) artist.textContent = t.a || '';
  var btn = document.getElementById('wmp-playbtn');
  if (btn) btn.textContent = '⏸';
  window._wmpPlaying = true;
};
window.wmpToggle = function() {
  if (window._wmpIdx < 0) { wmpPlay(0); return; }
  window._wmpPlaying = !window._wmpPlaying;
  var btn = document.getElementById('wmp-playbtn');
  if (btn) btn.textContent = window._wmpPlaying ? '⏸' : '▶';
};
window.wmpStop = function() {
  window._wmpPlaying = false;
  var btn = document.getElementById('wmp-playbtn');
  if (btn) btn.textContent = '▶';
  var title = document.getElementById('wmp-title');
  if (title) title.textContent = '⏹ 停止中';
};
window.wmpPrev = function() { wmpPlay(Math.max(0, (window._wmpIdx||0) - 1)); };
window.wmpNext = function() { wmpPlay(Math.min(4, (window._wmpIdx||0) + 1)); };

function _W_wmpVizStart() {
  var cv = document.getElementById('wmp-viz');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var bars = 60;
  var speeds = Array.from({ length: bars }, function() { return Math.random() * 0.08 + 0.02; });
  var heights = Array.from({ length: bars }, function() { return Math.random() * 60 + 10; });
  if (window._wmpVizIv) clearInterval(window._wmpVizIv);
  window._wmpVizIv = setInterval(function() {
    var w = cv.width, h = cv.height;
    cx.fillStyle = 'rgba(10,10,30,.6)';
    cx.fillRect(0, 0, w, h);
    if (!window._wmpPlaying) return;
    var bw = w / bars;
    for (var i = 0; i < bars; i++) {
      heights[i] += (Math.random() * 30 - 15) * speeds[i];
      heights[i] = Math.max(4, Math.min(h - 4, heights[i]));
      var bh = heights[i];
      var ratio = bh / h;
      var r = Math.floor(ratio * 100 + 50);
      var g = Math.floor(150 - ratio * 80);
      var b = Math.floor(255 - ratio * 100);
      cx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      cx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    }
  }, 50);
}

// ================================================================
//  ── アプリ: コントロールパネル ──
// ================================================================
window.wOpen_control = function() {
  var items = [
    { icon:'🖥',  label:'画面',       fn: 'wOpen_display' },
    { icon:'🖱',  label:'マウス',     fn: '' },
    { icon:'⌨️',  label:'キーボード', fn: '' },
    { icon:'🔊',  label:'サウンド',   fn: '' },
    { icon:'🌐',  label:'インターネット', fn: 'wOpen_ie' },
    { icon:'👤',  label:'ユーザー',   fn: '' },
    { icon:'📅',  label:'日付と時刻', fn: 'wOpen_datetime' },
    { icon:'⚙️',  label:'システム',   fn: 'wOpen_sysprop' },
    { icon:'🔒',  label:'セキュリティ', fn: '' },
    { icon:'🌍',  label:'地域と言語', fn: '' },
    { icon:'🖨',  label:'プリンタ',   fn: '' },
    { icon:'📡',  label:'ネットワーク', fn: '' },
  ];
  var html = '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:16px;align-content:flex-start">'+
    items.map(function(item) {
      return '<div '+(item.fn?'onclick="'+item.fn+'()"':'')+' style="display:flex;flex-direction:column;align-items:center;gap:4px;width:80px;cursor:'+(item.fn?'pointer':'default')+';border-radius:4px;padding:8px;transition:background .1s" onmouseover="this.style.background=\'#e8f0fe\'" onmouseout="this.style.background=\'\'">'+
        '<span style="font-size:30px">'+item.icon+'</span>'+
        '<span style="font-size:11px;text-align:center;color:#000">'+item.label+'</span>'+
      '</div>';
    }).join('') +
  '</div>';
  _W_create({ id:'control', title:'コントロール パネル', icon:'⚙️', html:html, w:600, h:420 });
};

// ================================================================
//  ── アプリ: システムのプロパティ ──
// ================================================================
window.wOpen_sysprop = function() {
  var html = [
    '<div style="padding:16px;font-family:Tahoma,sans-serif">',
      '<div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px">',
        '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Windows_logo_-_2002%E2%80%932012_%28Multicolored%29.svg/240px-Windows_logo_-_2002%E2%80%932012_%28Multicolored%29.svg.png" width="64" height="64" onerror="this.outerHTML=\'<span style=font-size:48px>🪟</span>\'">',
        '<div>',
          '<div style="font-size:15px;font-weight:700;color:#000">Microsoft Windows</div>',
          '<div style="font-size:13px;font-weight:600;color:#000">XP Professional</div>',
          '<div style="font-size:11px;color:#444;margin-top:4px">Version 5.1.2600<br>Service Pack 3</div>',
        '</div>',
      '</div>',
      '<div style="border:1px solid #ccc;border-radius:4px;padding:12px;background:#f8f8f8">',
        '<div style="font-size:12px;color:#000;line-height:2">',
          '<b>コンピュータ名:</b> UTILOHUB-PC<br>',
          '<b>ユーザー名:</b> '+(localStorage.getItem('uh2_setup_name')||'ゲスト')+'<br>',
          '<b>プロセッサ:</b> Intel(R) Pentium(R) 4 CPU 2.40GHz<br>',
          '<b>メモリ (RAM):</b> 1,024 MB<br>',
          '<b>仮想化:</b> UtiloHub VM 2.0 (WebAssembly)<br>',
          '<b>画面解像度:</b> '+window.innerWidth+'x'+window.innerHeight+'<br>',
        '</div>',
      '</div>',
      '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px">',
        '<button onclick="wOpen_control()" style="padding:4px 16px;background:#d4d0c8;border:2px outset #fff;cursor:pointer;font-size:12px;border-radius:2px">コントロール パネル(N)</button>',
        '<button onclick="_W_close(\'sysprop\')" style="padding:4px 16px;background:#d4d0c8;border:2px outset #fff;cursor:pointer;font-size:12px;border-radius:2px">OK</button>',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'sysprop', title:'システムのプロパティ', icon:'🖥', html:html, w:400, h:360, resizable:false });
};

// ================================================================
//  ── アプリ: 日付と時刻 ──
// ================================================================
window.wOpen_datetime = function() {
  var d = new Date();
  var html = [
    '<div style="padding:16px;font-family:Tahoma,sans-serif">',
      '<div style="font-size:36px;font-weight:300;text-align:center;color:#000;font-family:Consolas,monospace" id="wos-dt-clock"></div>',
      '<div style="font-size:14px;text-align:center;color:#444;margin-top:8px">'+d.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'})+'</div>',
      '<div style="margin-top:16px;text-align:center;color:#444;font-size:12px">',
        'タイムゾーン: Japan Standard Time (UTC+9:00)',
      '</div>',
      '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px">',
        '<button onclick="_W_close(\'datetime\')" style="padding:4px 16px;background:#d4d0c8;border:2px outset #fff;cursor:pointer;font-size:12px;border-radius:2px">OK</button>',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'datetime', title:'日付と時刻のプロパティ', icon:'📅', html:html, w:320, h:240, resizable:false });
  var dtIv = setInterval(function() {
    var c = document.getElementById('wos-dt-clock');
    if (!c) { clearInterval(dtIv); return; }
    c.textContent = new Date().toLocaleTimeString('ja-JP');
  }, 500);
};

// ================================================================
//  ── アプリ: 検索 ──
// ================================================================
window.wOpen_search = function() {
  var html = [
    '<div style="display:flex;height:100%">',
      '<div style="width:200px;background:#dce8f4;border-right:1px solid #aac0dc;padding:16px;font-size:12px">',
        '<div style="font-size:14px;font-weight:700;color:#1a4ab0;margin-bottom:12px">🔍 検索コンパニオン</div>',
        '<div style="margin-bottom:12px">',
          '<div style="margin-bottom:4px;color:#444">検索する文字列:</div>',
          '<input id="wos-search-q" style="width:100%;box-sizing:border-box;border:1px inset #aaa;padding:3px 6px;font-size:12px" placeholder="キーワード入力...">',
        '</div>',
        '<button onclick="wDoSearch()" style="background:#d4d0c8;border:2px outset #fff;padding:4px 12px;cursor:pointer;font-size:12px;border-radius:2px;width:100%">🔍 検索開始</button>',
      '</div>',
      '<div id="wos-search-res" style="flex:1;padding:16px;font-size:12px;color:#444">',
        'キーワードを入力して「検索開始」をクリックしてください。',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'search', title:'検索', icon:'🔍', html:html, w:600, h:420 });
};
window.wDoSearch = function() {
  var q = document.getElementById('wos-search-q');
  if (!q || !q.value.trim()) return;
  var res = document.getElementById('wos-search-res');
  if (!res) return;
  var files = JSON.parse(localStorage.getItem('wos_docs') || '[]');
  var found = files.filter(function(f) { return f.name.includes(q.value) || (f.body || '').includes(q.value); });
  res.innerHTML = found.length
    ? '<div style="font-weight:700;margin-bottom:8px">検索結果: '+found.length+' 件</div>' + found.map(function(f) { return '<div style="padding:6px 8px;border-bottom:1px solid #eee;cursor:pointer" ondblclick="wOpen_notepad(\''+_W_esc(f.name)+'\',\''+_W_esc(f.body||'')+'\')">📄 '+_W_esc(f.name)+'</div>'; }).join('')
    : '<div style="color:#888">「'+_W_esc(q.value)+'」に一致するファイルが見つかりませんでした。</div>';
};

// ================================================================
//  ── アプリ: ヘルプ ──
// ================================================================
window.wOpen_help = function() {
  var html = [
    '<div style="display:flex;height:100%">',
      '<div style="width:200px;background:#dce8f4;border-right:1px solid #aac0dc;padding:12px;font-size:12px;overflow-y:auto">',
        '<div style="font-weight:700;color:#1a4ab0;margin-bottom:10px;font-size:13px">📚 目次</div>',
        ['はじめに','デスクトップの使い方','ウィンドウの操作','ファイルの管理','インターネット','メモ帳の使い方','ペイントの使い方','電卓の使い方','コマンドプロンプト','困ったときは'].map(function(t) {
          return '<div style="padding:4px 6px;cursor:pointer;border-radius:3px;color:#1a4ab0;text-decoration:underline" onmouseover="this.style.background=\'rgba(30,80,200,.1)\'" onmouseout="this.style.background=\'\'">'+t+'</div>';
        }).join(''),
      '</div>',
      '<div style="flex:1;padding:16px;font-size:12px;line-height:1.8;overflow-y:auto;color:#000">',
        '<h3 style="margin:0 0 12px;color:#1a4ab0;border-bottom:1px solid #c0c0c0;padding-bottom:6px">UtiloHub Windows 環境へようこそ</h3>',
        '<p>このカスタム Windows 環境では、実際の Windows XP に似た操作体験ができます。</p>',
        '<p><b>主な機能:</b></p>',
        '<ul style="margin:4px 0;padding-left:20px">',
          '<li>デスクトップアイコンのダブルクリックでアプリを起動</li>',
          '<li>スタートメニューからすべてのアプリにアクセス</li>',
          '<li>ウィンドウのドラッグ・リサイズ・最小化・最大化</li>',
          '<li>メモ帳でテキストファイルを作成・保存</li>',
          '<li>ペイントで絵を描いてPNG保存</li>',
          '<li>電卓で計算</li>',
          '<li>コマンドプロンプトでコマンド実行</li>',
          '<li>Internet Explorerでウェブ閲覧(本物)</li>',
        '</ul>',
        '<p style="margin-top:12px;color:#666;font-size:11px">UtiloHub Windows Environment v2.0 © KanoraStudio</p>',
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'help', title:'ヘルプとサポート', icon:'❓', html:html, w:700, h:480 });
};

// ================================================================
//  ── アプリ: Cドライブ ──
// ================================================================
window.wOpen_cdrive = function() {
  var html = [
    '<div style="padding:12px;font-size:12px">',
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:#000">📁 ローカルディスク (C:)</div>',
      '<div style="display:flex;flex-wrap:wrap;gap:12px">',
        [
          { icon:'📁', name:'Windows', sub:'システムフォルダ' },
          { icon:'📁', name:'Program Files', sub:'アプリケーション' },
          { icon:'📁', name:'Documents and Settings', sub:'ユーザーファイル' },
          { icon:'📁', name:'My Documents', sub:'ドキュメント', fn:'wOpen_docs' },
          { icon:'📁', name:'RECYCLER', sub:'ごみ箱' },
          { icon:'📄', name:'boot.ini', sub:'起動設定' },
          { icon:'📄', name:'pagefile.sys', sub:'512 MB' },
        ].map(function(f) {
          return '<div '+(f.fn?'ondblclick="'+f.fn+'()"':'')+' style="display:flex;flex-direction:column;align-items:center;gap:3px;width:80px;cursor:'+(f.fn?'pointer':'default')+';border-radius:4px;padding:6px;transition:background .1s" onmouseover="this.style.background=\'#e8f0fe\'" onmouseout="this.style.background=\'\'">'+
            '<span style="font-size:28px">'+f.icon+'</span>'+
            '<span style="font-size:10px;text-align:center;color:#000;word-break:break-all">'+f.name+'</span>'+
            '<span style="font-size:9px;color:#888">'+f.sub+'</span>'+
          '</div>';
        }).join(''),
      '</div>',
    '</div>',
  ].join('');
  _W_create({ id:'cdrive', title:'ローカルディスク (C:)', icon:'💿', html:html, w:580, h:400 });
};

// ================================================================
//  ユーティリティ
// ================================================================
function _W_esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// 後方互換
window.wOpen_notepad  = window.wOpen_notepad  || function() {};
window.wOpen_paint    = window.wOpen_paint    || function() {};
window.wOpen_calc     = window.wOpen_calc     || function() {};
window.wOpen_cmd      = window.wOpen_cmd      || function() {};
window.wOpen_ie       = window.wOpen_ie       || function() {};
window.wOpen_explorer = window.wOpen_explorer || function() {};
window.wOpen_docs     = window.wOpen_docs     || function() {};
window.wOpen_pics     = window.wOpen_pics     || function() {};
window.wOpen_music    = window.wOpen_music    || function() {};
window.wOpen_media    = window.wOpen_media    || function() {};
window.wOpen_control  = window.wOpen_control  || function() {};
window.wOpen_search   = window.wOpen_search   || function() {};
window.wOpen_help     = window.wOpen_help     || function() {};
window.wOpen_sysprop  = window.wOpen_sysprop  || function() {};
window.wOpen_datetime = window.wOpen_datetime || function() {};
window.wOpen_cdrive   = window.wOpen_cdrive   || function() {};
window.wOpen_display  = window.wOpen_display  || function() { wOpen_control(); };
