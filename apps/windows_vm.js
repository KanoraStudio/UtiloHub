// ===================================================================
//  UtiloHub — Windows XP VM  (完全版)
// ===================================================================

// ── グローバル状態 ──
var _wWins = {};      // 開いているウィンドウ
var _wZ    = 100;     // z-index カウンタ
var _wStartOpen = false;
var _wMem  = 0;       // 電卓メモリ

// ================================================================
//  エントリポイント：VMを表示する
// ================================================================
window.launchWindowsVM = function() {
  // 既に開いていたら最前面へ
  var el = document.getElementById('win-fullscreen');
  if(el && el.style.display === 'flex') return;

  _buildWinDOM();
  var vm = document.getElementById('win-fullscreen');
  vm.style.display = 'flex';
  vm.style.opacity = '0';
  setTimeout(function(){ vm.style.transition='opacity .3s'; vm.style.opacity='1'; }, 10);

  // スタートメニューのユーザー情報
  var av = localStorage.getItem('uh2_setup_av') || '😊';
  var nm = localStorage.getItem('uh2_setup_name') || 'ゲスト';
  var el2 = document.getElementById('wsm-av'); if(el2) el2.textContent = av;
  var el3 = document.getElementById('wsm-nm'); if(el3) el3.textContent = nm;

  _wStartClock();
  _renderDesktopIcons();
};

window.closeWindowsVM = function() {
  var vm = document.getElementById('win-fullscreen');
  if(!vm) return;
  vm.style.transition = 'opacity .3s';
  vm.style.opacity = '0';
  setTimeout(function(){ vm.style.display='none'; _wWins={}; _wZ=100; }, 300);
};

// ================================================================
//  DOM 構築（初回のみ）
// ================================================================
window._buildWinDOM = function() {
  if(document.getElementById('win-fullscreen')) return;

  var div = document.createElement('div');
  div.id = 'win-fullscreen';
  div.style.cssText = [
    'position:fixed;inset:0;z-index:50000;display:none;flex-direction:column',
    'font-family:"Segoe UI",Tahoma,Arial,sans-serif;font-size:13px'
  ].join(';');

  div.innerHTML = [
    // ── デスクトップ ──
    '<div id="win-desktop" style="flex:1;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a6fc4 0%,#3a9bd5 45%,#5bb8f0 100%)">',
      // Bliss 丘
      '<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:42%;background:linear-gradient(180deg,#5ec936 0%,#3aaa1c 100%);border-radius:60% 60% 0 0 / 100px 100px 0 0"></div>',
      // アイコンエリア
      '<div id="win-icon-area" style="position:absolute;top:8px;left:8px;display:flex;flex-direction:column;gap:2px"></div>',
      // ウィンドウエリア
      '<div id="win-warea" style="position:absolute;inset:0"></div>',
      // スタートメニュー
      '<div id="win-startmenu" style="',
        'display:none;position:absolute;bottom:40px;left:0;width:380px;',
        'background:#fff;border:1px solid #0054e3;border-radius:8px 8px 0 0;',
        'overflow:hidden;flex-direction:column;',
        'box-shadow:4px -2px 16px rgba(0,0,0,.5);z-index:9999',
      '">',
        // ヘッダー
        '<div style="background:linear-gradient(90deg,#245edb,#1a48b8);padding:10px 14px;display:flex;align-items:center;gap:12px">',
          '<div id="wsm-av" style="width:48px;height:48px;border-radius:4px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:30px;border:2px solid rgba(255,255,255,.5)">😊</div>',
          '<div id="wsm-nm" style="font-size:15px;font-weight:700;color:white;text-shadow:1px 1px 2px rgba(0,0,0,.5)">ゲスト</div>',
        '</div>',
        // ボディ
        '<div style="display:flex;min-height:260px">',
          // 左
          '<div style="flex:1;border-right:1px solid #d0d0d0;padding:4px 0">',
            _smItem('🌐','Internet Explorer','Webブラウザ','wOpen_ie()'),
            _smItem('📄','メモ帳','テキストエディタ','wOpen_notepad()'),
            _smItem('🎨','ペイント','画像エディタ','wOpen_paint()'),
            _smItem('🧮','電卓','calc.exe','wOpen_calc()'),
            _smItem('🖤','コマンドプロンプト','cmd.exe','wOpen_cmd()'),
            _smItem('🎵','Windows Media Player','音楽プレイヤー','wOpen_media()'),
            '<div style="height:1px;background:#ccc;margin:4px 8px"></div>',
            _smItem('⚙️','すべてのプログラム →','',''),
          '</div>',
          // 右
          '<div style="flex:1;background:#d8e4f8;padding:4px 0">',
            '<div style="font-size:10px;font-weight:700;color:#245edb;padding:6px 12px 2px;text-transform:uppercase">マイ</div>',
            _smItem('📁','マイドキュメント','','wOpen_docs()'),
            _smItem('🖼','マイピクチャ','','wOpen_pics()'),
            _smItem('🎵','マイミュージック','','wOpen_music()'),
            _smItem('🖥','マイコンピュータ','','wOpen_mypc()'),
            '<div style="height:1px;background:#b0c0d8;margin:4px 8px"></div>',
            '<div style="font-size:10px;font-weight:700;color:#245edb;padding:6px 12px 2px;text-transform:uppercase">設定</div>',
            _smItem('🔧','コントロールパネル','','wOpen_control()'),
            _smItem('🖨','プリンタと FAX','','wOpen_printers()'),
            _smItem('🔍','検索','','wOpen_search()'),
            _smItem('❓','ヘルプとサポート','','wOpen_help()'),
          '</div>',
        '</div>',
        // フッター
        '<div style="background:linear-gradient(180deg,#245edb,#1a48b8);display:flex;justify-content:flex-end;gap:6px;padding:6px 8px">',
          '<button onclick="wToggleStart();alert(\'ログオフ\')" style="background:linear-gradient(180deg,#4a80d4,#2460c0);border:1px solid rgba(255,255,255,.2);color:white;padding:4px 14px;border-radius:3px;cursor:pointer;font-family:inherit;font-size:12px">🔄 ログオフ(L)</button>',
          '<button onclick="closeWindowsVM()" style="background:linear-gradient(180deg,#ff6060,#cc0000);border:1px solid rgba(255,255,255,.2);color:white;padding:4px 14px;border-radius:3px;cursor:pointer;font-family:inherit;font-size:12px">⏻ 電源を切る(U)</button>',
        '</div>',
      '</div>',
      // 右上の戻るボタン
      '<button onclick="closeWindowsVM()" style="position:absolute;top:6px;right:8px;z-index:10001;background:linear-gradient(180deg,#ff7070,#cc0000);border:1px solid #800;color:white;padding:4px 14px;font-size:12px;font-weight:700;border-radius:4px;cursor:pointer;box-shadow:1px 1px 4px rgba(0,0,0,.4)">✕ UtiloHubに戻る</button>',
    '</div>',

    // ── タスクバー ──
    '<div id="win-taskbar" style="',
      'height:40px;display:flex;align-items:center;flex-shrink:0;',
      'background:linear-gradient(180deg,#245edb 0%,#1a48b8 45%,#1a54cc 46%,#2468e8 100%);',
      'border-top:2px solid #0a2a9a;position:relative;z-index:9998',
    '">',
      // スタートボタン
      '<button id="win-start-btn" onclick="wToggleStart()" style="',
        'height:100%;padding:0 14px 0 8px;',
        'background:linear-gradient(180deg,#5ec95e 0%,#3aaa3a 45%,#2e9e2e 46%,#4ec44e 100%);',
        'border:none;border-right:2px solid #1a8a1a;border-radius:0 14px 14px 0;',
        'color:white;font-size:15px;font-weight:900;cursor:pointer;',
        'display:flex;align-items:center;gap:7px;',
        'font-family:"Franklin Gothic Medium","Arial Narrow",Arial,sans-serif;',
        'text-shadow:1px 1px 2px rgba(0,0,0,.6);',
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.3),2px 0 6px rgba(0,0,0,.3)',
      '">',
        '<svg width="20" height="20" viewBox="0 0 88 88">',
          '<rect x="2" y="2" width="38" height="38" rx="4" fill="#F25022"/>',
          '<rect x="48" y="2" width="38" height="38" rx="4" fill="#7FBA00"/>',
          '<rect x="2" y="48" width="38" height="38" rx="4" fill="#00A4EF"/>',
          '<rect x="48" y="48" width="38" height="38" rx="4" fill="#FFB900"/>',
        '</svg>',
        'スタート',
      '</button>',
      // タスクボタンエリア
      '<div id="win-taskbtns" style="flex:1;display:flex;gap:3px;padding:0 6px;overflow:hidden;align-items:center"></div>',
      // システムトレイ
      '<div style="display:flex;align-items:center;gap:8px;padding:0 10px;background:linear-gradient(180deg,#1248b8,#0a3090);height:100%;border-left:1px solid rgba(255,255,255,.15)">',
        '<span style="font-size:16px;cursor:pointer" title="音量">🔊</span>',
        '<span style="font-size:16px;cursor:pointer" title="ネットワーク">🌐</span>',
        '<div id="win-clock" style="text-align:center;font-size:12px;color:rgba(255,255,255,.95);line-height:1.4;cursor:pointer;min-width:48px"></div>',
      '</div>',
    '</div>'
  ].join('');

  document.body.appendChild(div);
};

function _smItem(icon, label, sub, fn) {
  var cl = fn ? 'cursor:pointer' : 'cursor:default;color:#aaa';
  var click = fn ? 'onclick="wToggleStart();'+fn+'"' : '';
  return '<div '+click+' style="display:flex;align-items:center;gap:10px;padding:5px 12px;'+cl+';transition:background .1s" onmouseover="if(\''+fn+'\')this.style.background=\'#316ac5\';this.style.color=\'white\'" onmouseout="this.style.background=\'\';this.style.color=\'\'">'+
    '<span style="font-size:22px;flex-shrink:0">'+icon+'</span>'+
    '<div><div style="font-size:12px">'+label+'</div>'+(sub?'<div style="font-size:10px;color:#888">'+sub+'</div>':'')+'</div>'+
  '</div>';
}

// ================================================================
//  デスクトップアイコン
// ================================================================
var _wDesktopIcons = [
  {icon:'🖥',label:'マイ\nコンピュータ', fn:'wOpen_mypc'},
  {icon:'📁',label:'マイ\nドキュメント', fn:'wOpen_docs'},
  {icon:'🌐',label:'Internet\nExplorer',  fn:'wOpen_ie'},
  {icon:'📄',label:'メモ帳',              fn:'wOpen_notepad'},
  {icon:'🎨',label:'ペイント',            fn:'wOpen_paint'},
  {icon:'🧮',label:'電卓',               fn:'wOpen_calc'},
  {icon:'🖤',label:'コマンド\nプロンプト',fn:'wOpen_cmd'},
  {icon:'🎵',label:'Media\nPlayer',      fn:'wOpen_media'},
  {icon:'⚙️',label:'コントロール\nパネル',fn:'wOpen_control'},
  {icon:'🗑',label:'ごみ箱',             fn:'wOpen_trash'},
];

window._renderDesktopIcons = function() {
  var area = document.getElementById('win-icon-area');
  if(!area) return;
  area.innerHTML = '';
  _wDesktopIcons.forEach(function(ic) {
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px;border-radius:4px;cursor:pointer;width:72px;user-select:none';
    d.innerHTML = '<div style="font-size:36px;filter:drop-shadow(1px 2px 4px rgba(0,0,0,.6))">'+ic.icon+'</div>'+
      '<div style="font-size:11px;color:white;text-align:center;text-shadow:1px 1px 2px #000,0 0 6px rgba(0,0,0,.8);white-space:pre-line;line-height:1.3">'+ic.label+'</div>';
    d.ondblclick = function(){ if(window[ic.fn]) window[ic.fn](); };
    d.onclick = function(){
      document.querySelectorAll('#win-icon-area > div').forEach(function(x){ x.style.background=''; x.style.border=''; });
      d.style.background='rgba(49,106,197,.6)';
      d.style.border='1px dotted rgba(255,255,255,.8)';
    };
    d.onmouseenter = function(){ if(d.style.background.indexOf('49,106')<0) d.style.background='rgba(255,255,255,.15)'; };
    d.onmouseleave = function(){ if(d.style.background.indexOf('49,106')<0) d.style.background=''; };
    area.appendChild(d);
  });
};

// ================================================================
//  ウィンドウマネージャ
// ================================================================
window._wCreate = function(id, title, icon, bodyHTML, w, h) {
  if(_wWins[id]) { _wFocus(id); return; }
  var area = document.getElementById('win-warea');
  if(!area) return;
  var cnt  = Object.keys(_wWins).length;
  var x = 60 + cnt*28, y = 40 + cnt*28;

  var el = document.createElement('div');
  el.id = 'wwin-'+id;
  el.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;z-index:'+(++_wZ)+';display:flex;flex-direction:column;border-radius:8px 8px 0 0;border:2px solid #0054e3;box-shadow:2px 2px 12px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.2);overflow:visible;min-width:200px;min-height:80px';

  el.innerHTML =
    // タイトルバー
    '<div id="wtb-'+id+'" style="height:30px;display:flex;align-items:center;padding:0 6px;background:linear-gradient(180deg,#4d9cf0 0%,#1462d1 50%,#1a75e8 100%);border-radius:6px 6px 0 0;cursor:move;user-select:none;flex-shrink:0">'+
      '<span style="font-size:14px;margin-right:6px">'+icon+'</span>'+
      '<span style="flex:1;font-size:12px;font-weight:700;color:white;text-shadow:1px 1px 2px rgba(0,0,0,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+title+'</span>'+
      '<div style="display:flex;gap:3px;margin-left:6px">'+
        '<button onclick="wMin(\''+id+'\')" style="'+_tbBtnStyle('#ffd020','#b89000')+'" title="最小化">_</button>'+
        '<button onclick="wMax(\''+id+'\')" style="'+_tbBtnStyle('#28c840','#007000')+'" title="最大化">□</button>'+
        '<button onclick="wClose(\''+id+'\')" style="'+_tbBtnStyle('#ff3b30','#a00000')+'" title="閉じる">✕</button>'+
      '</div>'+
    '</div>'+
    // メニューバー
    '<div id="wmb-'+id+'" style="height:22px;display:flex;align-items:center;padding:0 4px;background:#f0f0f0;border-bottom:1px solid #c0c0c0;flex-shrink:0;font-size:12px"></div>'+
    // ボディ
    '<div id="wbody-'+id+'" style="flex:1;overflow:auto;background:#fff;border-top:none">'+bodyHTML+'</div>'+
    // ステータスバー
    '<div id="wst-'+id+'" style="height:20px;display:flex;align-items:center;padding:0 8px;background:linear-gradient(180deg,#e0e0e0,#d0d0d0);border-top:1px solid #aaa;font-size:11px;color:#444;flex-shrink:0">準備完了</div>';

  area.appendChild(el);
  _wWins[id] = {id,title,icon,w,h,x,y,minimized:false,maximized:false,focused:true};
  _wFocus(id);
  _wMakeDrag(id);
  _wMakeResize(id);
  _wRefreshTaskbar();
};

function _tbBtnStyle(bg, shadow) {
  return 'width:21px;height:21px;border-radius:3px;border:1px solid rgba(0,0,0,.35);font-size:11px;font-weight:700;cursor:pointer;background:'+bg+';box-shadow:0 1px 0 rgba(255,255,255,.4) inset,0 1px 2px rgba(0,0,0,.3);color:rgba(0,0,0,.7);transition:filter .08s;';
}

window.wClose = function(id) {
  var el = document.getElementById('wwin-'+id);
  if(el){ el.style.transition='transform .12s,opacity .12s'; el.style.transform='scale(.92)'; el.style.opacity='0'; setTimeout(function(){el.remove();},120); }
  delete _wWins[id];
  _wRefreshTaskbar();
};
window.wMin = function(id) {
  var el = document.getElementById('wwin-'+id); var w = _wWins[id];
  if(!el||!w) return;
  el.style.transition='transform .15s,opacity .15s';
  el.style.transform='scale(.85) translateY(40px)'; el.style.opacity='0';
  setTimeout(function(){ el.style.display='none'; el.style.transform=''; el.style.opacity=''; el.style.transition=''; },150);
  w.minimized=true; w.focused=false; _wRefreshTaskbar();
};
window.wMax = function(id) {
  var el = document.getElementById('wwin-'+id); var w = _wWins[id];
  if(!el||!w) return;
  if(w.maximized){
    el.style.cssText='position:absolute;left:'+w.sx+'px;top:'+w.sy+'px;width:'+w.w+'px;height:'+w.h+'px;z-index:'+(++_wZ)+';display:flex;flex-direction:column;border-radius:8px 8px 0 0;border:2px solid #0054e3;box-shadow:2px 2px 12px rgba(0,0,0,.6);overflow:visible;min-width:200px;min-height:80px';
    w.maximized=false;
  } else {
    w.sx=el.offsetLeft; w.sy=el.offsetTop;
    el.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;z-index:'+(++_wZ)+';display:flex;flex-direction:column;border-radius:0;border:none;overflow:visible';
    w.maximized=true;
  }
  _wFocus(id);
};
window._wFocus = function(id) {
  Object.keys(_wWins).forEach(function(k){ _wWins[k].focused=false; });
  if(_wWins[id]) _wWins[id].focused=true;
  document.querySelectorAll('#win-warea>[id^="wwin-"]').forEach(function(el){
    var tb=el.querySelector('[id^="wtb-"]');
    if(tb) tb.style.background='linear-gradient(180deg,#9db8d2,#7ba0c0)';
  });
  var el=document.getElementById('wwin-'+id);
  if(el){
    el.style.zIndex=++_wZ;
    var tb=el.querySelector('[id^="wtb-"]');
    if(tb) tb.style.background='linear-gradient(180deg,#4d9cf0 0%,#1462d1 50%,#1a75e8 100%)';
  }
  _wRefreshTaskbar();
};
window._wMakeDrag = function(id) {
  var tb=document.getElementById('wtb-'+id), win=document.getElementById('wwin-'+id);
  if(!tb||!win) return;
  var dragging=false, ox=0, oy=0;
  tb.onmousedown=function(e){ if(e.target.tagName==='BUTTON') return; dragging=true; ox=e.clientX-win.offsetLeft; oy=e.clientY-win.offsetTop; _wFocus(id); e.preventDefault(); };
  document.addEventListener('mousemove',function(e){ if(!dragging)return; win.style.left=Math.max(0,e.clientX-ox)+'px'; win.style.top=Math.max(0,e.clientY-oy)+'px'; });
  document.addEventListener('mouseup',function(){ dragging=false; });
  win.onmousedown=function(){ _wFocus(id); };
};
window._wMakeResize = function(id) {
  var el=document.getElementById('wwin-'+id); if(!el) return;
  var handle=document.createElement('div');
  handle.style.cssText='position:absolute;bottom:0;right:0;width:12px;height:12px;cursor:se-resize;z-index:10;background:linear-gradient(135deg,transparent 50%,#aaa 50%)';
  var resizing=false, sx=0, sy=0, sw=0, sh=0;
  handle.onmousedown=function(e){ resizing=true; sx=e.clientX; sy=e.clientY; sw=el.offsetWidth; sh=el.offsetHeight; e.preventDefault(); e.stopPropagation(); };
  document.addEventListener('mousemove',function(e){ if(!resizing)return; el.style.width=Math.max(200,sw+e.clientX-sx)+'px'; el.style.height=Math.max(100,sh+e.clientY-sy)+'px'; });
  document.addEventListener('mouseup',function(){ resizing=false; });
  el.appendChild(handle);
};
window._wRefreshTaskbar = function() {
  var bar=document.getElementById('win-taskbtns'); if(!bar) return;
  bar.innerHTML='';
  Object.values(_wWins).forEach(function(w){
    var btn=document.createElement('button');
    btn.style.cssText='height:28px;padding:0 10px;background:linear-gradient(180deg,'+(w.focused?'#1a4a9a,#2460c0':'#3a7ad4,#2460c0')+');border:1px solid rgba(255,255,255,.2);color:white;font-size:12px;cursor:pointer;border-radius:3px;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:inherit;box-shadow:'+(w.focused?'inset 0 2px 4px rgba(0,0,0,.3)':'inset 0 1px 0 rgba(255,255,255,.2)');
    btn.textContent=w.icon+' '+w.title;
    btn.onclick=function(){ if(w.minimized){ var el=document.getElementById('wwin-'+w.id); if(el){ el.style.display='flex'; w.minimized=false; _wFocus(w.id); } } else if(w.focused){ wMin(w.id); } else { _wFocus(w.id); } };
    bar.appendChild(btn);
  });
};

// ================================================================
//  メニューバーヘルパー
// ================================================================
window._wSetMenu = function(id, menus) {
  var bar=document.getElementById('wmb-'+id); if(!bar) return;
  bar.innerHTML='';
  menus.forEach(function(m){
    var label=typeof m==='string'?m:m.label;
    var items=typeof m==='object'?m.items:null;
    var span=document.createElement('span');
    span.style.cssText='padding:2px 8px;cursor:pointer;border-radius:3px;color:#000;user-select:none';
    span.textContent=label;
    span.onmouseover=function(){ span.style.background='#316ac5'; span.style.color='white'; };
    span.onmouseout=function(){ span.style.background=''; span.style.color='#000'; };
    if(items){
      span.onclick=function(e){
        e.stopPropagation();
        document.querySelectorAll('.wdropdown').forEach(function(d){ d.remove(); });
        var dd=document.createElement('div');
        dd.className='wdropdown';
        var wr=document.getElementById('wwin-'+id).getBoundingClientRect();
        var sr=span.getBoundingClientRect();
        dd.style.cssText='position:fixed;background:#f0f0f0;border:1px solid #aaa;box-shadow:2px 2px 6px rgba(0,0,0,.3);z-index:99999;min-width:180px;padding:2px 0;font-size:12px;font-family:Segoe UI,Tahoma,sans-serif;left:'+(sr.left)+'px;top:'+(sr.bottom)+'px';
        items.forEach(function(si){
          if(si==='---'){ var sep=document.createElement('div'); sep.style.cssText='height:1px;background:#aaa;margin:3px 0'; dd.appendChild(sep); return; }
          var di=document.createElement('div');
          di.style.cssText='padding:4px 20px;cursor:pointer;color:#000;white-space:nowrap';
          di.textContent=si.label||si;
          di.onmouseover=function(){ di.style.background='#316ac5'; di.style.color='white'; };
          di.onmouseout=function(){ di.style.background=''; di.style.color='#000'; };
          di.onclick=function(){ dd.remove(); if(si.fn) window[si.fn]&&window[si.fn](id); };
          dd.appendChild(di);
        });
        document.body.appendChild(dd);
        setTimeout(function(){ document.addEventListener('click',function h(){ dd.remove(); document.removeEventListener('click',h); },{once:true}); },0);
      };
    }
    bar.appendChild(span);
  });
};

// ================================================================
//  スタートメニュー
// ================================================================
window.wToggleStart = function() {
  _wStartOpen=!_wStartOpen;
  var sm=document.getElementById('win-startmenu');
  if(sm) sm.style.display=_wStartOpen?'flex':'none';
};
document.addEventListener('click',function(e){
  if(_wStartOpen && !e.target.closest('#win-startmenu') && e.target.id!=='win-start-btn' && !e.target.closest('#win-start-btn')){
    _wStartOpen=false;
    var sm=document.getElementById('win-startmenu');
    if(sm) sm.style.display='none';
  }
});

// ================================================================
//  時計
// ================================================================
window._wStartClock = function() {
  var tick=function(){
    var c=document.getElementById('win-clock'); if(!c)return;
    var n=new Date();
    c.innerHTML=n.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})+'<br><span style="font-size:10px">'+n.toLocaleDateString('ja-JP',{month:'2-digit',day:'2-digit'})+'</span>';
  };
  tick(); setInterval(tick,1000);
};

// ================================================================
//  アプリ群
// ================================================================

// ── マイコンピュータ ──
window.wOpen_mypc = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:4px 0 6px;text-transform:uppercase">システムタスク</div>'+
      '<div class="wexp-link" onclick="alert(\'システム情報\')">ℹ️ システム情報</div>'+
      '<div class="wexp-link" onclick="wOpen_control()">⚙️ コントロールパネル</div>'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:10px 0 6px;text-transform:uppercase">その他の場所</div>'+
      '<div class="wexp-link" onclick="wOpen_docs()">📁 マイドキュメント</div>'+
      '<div class="wexp-link" onclick="alert(\'ネットワーク\')">🌐 マイネットワーク</div>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto">'+
      '<div style="font-size:11px;font-weight:700;color:#245edb;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #c0c0c0">ハードディスクドライブ</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:10px">'+
        _driveCard('💿','ローカルディスク (C:)','62.3 GB 空き / 80 GB','wOpen_cdrive'),
        _driveCard('💿','ローカルディスク (D:)','35.1 GB 空き / 40 GB',''),
      '</div>'+
      '<div style="font-size:11px;font-weight:700;color:#245edb;margin:14px 0 8px;padding-bottom:6px;border-bottom:1px solid #c0c0c0">デバイス（リムーバブル）</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:10px">'+
        _driveCard('💿','DVD ドライブ (E:)','ディスクなし',''),
        _driveCard('💾','フロッピー (A:)','1.44 MB',''),
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('mypc','マイコンピュータ','🖥',html,640,440);
  _wSetMenu('mypc',[
    {label:'ファイル',items:['---',{label:'閉じる',fn:'_wCloseFromMenu'}]},
    {label:'編集',items:['すべて選択','---','コピー','貼り付け']},
    {label:'表示',items:['縮小版','アイコン','一覧','詳細']},
    {label:'お気に入り',items:['お気に入りに追加...']},
    {label:'ヘルプ',items:['ヘルプとサポート']},
  ]);
  _addExpStyle();
};
function _driveCard(ic,name,info,fn){
  var click=fn?'ondblclick="'+fn+'()"':'ondblclick="alert(\''+name+'\')"';
  return '<div '+click+' style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid #c0c0c0;border-radius:4px;background:#fff;cursor:pointer;min-width:200px" onmouseover="this.style.background=\'#d8e4f8\'" onmouseout="this.style.background=\'#fff\'">'+
    '<span style="font-size:32px">'+ic+'</span>'+
    '<div><div style="font-size:12px;font-weight:600">'+name+'</div><div style="font-size:11px;color:#666">'+info+'</div></div>'+
  '</div>';
}
window._wCloseFromMenu = function(id) { wClose(id); };

// Cドライブ（フォルダ一覧）
window.wOpen_cdrive = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div class="wexp-link" onclick="wOpen_mypc()">🖥 マイコンピュータ</div>'+
      '<div class="wexp-link" onclick="wOpen_docs()">📁 マイドキュメント</div>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto">'+
      '<div style="font-size:11px;font-weight:700;color:#245edb;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #c0c0c0">ローカルディスク (C:)</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
        ['Documents and Settings','Program Files','WINDOWS','pagefile.sys'].map(function(f){
          var isDir=!f.includes('.');
          return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px;width:80px;cursor:pointer;border-radius:4px" ondblclick="alert(\''+f+'\')" onmouseover="this.style.background=\'#d8e4f8\'" onmouseout="this.style.background=\'\'"><span style="font-size:32px">'+(isDir?'📁':'📄')+'</span><span style="font-size:11px;text-align:center;word-break:break-word">'+f+'</span></div>';
        }).join('')+
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('cdrive','ローカルディスク (C:)','💿',html,580,400);
  _wSetMenu('cdrive',[{label:'ファイル',items:['---',{label:'閉じる',fn:'_wCloseFromMenu'}]},{label:'表示',items:['アイコン','一覧','詳細']}]);
  _addExpStyle();
};

// ── マイドキュメント ──
window.wOpen_docs = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:4px 0 6px;text-transform:uppercase">ファイルのタスク</div>'+
      '<div class="wexp-link" onclick="wOpen_notepad()">📄 新しいテキスト文書</div>'+
      '<div class="wexp-link" onclick="alert(\'印刷\')">🖨 印刷</div>'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:10px 0 6px;text-transform:uppercase">その他の場所</div>'+
      '<div class="wexp-link" onclick="wOpen_mypc()">🖥 マイコンピュータ</div>'+
      '<div class="wexp-link" onclick="wOpen_pics()">🖼 マイピクチャ</div>'+
      '<div class="wexp-link" onclick="wOpen_music()">🎵 マイミュージック</div>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto" id="wdocs-main">'+
      '<div style="font-size:11px;font-weight:700;color:#245edb;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #c0c0c0">マイドキュメント</div>'+
      '<div id="wdocs-list" style="display:flex;flex-wrap:wrap;gap:8px"></div>'+
    '</div>'+
  '</div>';
  _wCreate('docs','マイドキュメント','📁',html,640,440);
  _wSetMenu('docs',[
    {label:'ファイル',items:[{label:'新規テキスト文書',fn:'_wNewTxt'},{label:'---'},{label:'閉じる',fn:'_wCloseFromMenu'}]},
    {label:'表示',items:['アイコン','一覧','詳細']},
  ]);
  _addExpStyle();
  _wRenderDocs();
};
window._wNewTxt = function(){ wOpen_notepad(); };
window._wRenderDocs = function(){
  var list=document.getElementById('wdocs-list'); if(!list) return;
  var files=JSON.parse(localStorage.getItem('win_docs')||'[]');
  if(!files.length){ list.innerHTML='<div style="padding:30px;color:#888;font-size:13px">ファイルがありません</div>'; return; }
  list.innerHTML=files.map(function(f,i){
    return '<div ondblclick="wEditDoc('+i+')" style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px;width:80px;cursor:pointer;border-radius:4px" onmouseover="this.style.background=\'#d8e4f8\'" onmouseout="this.style.background=\'\'"><span style="font-size:32px">📄</span><span style="font-size:11px;text-align:center;word-break:break-word">'+f.name+'.txt</span><span style="font-size:10px;color:#888">'+f.body.length+' B</span></div>';
  }).join('');
};
window.wEditDoc = function(i){
  var files=JSON.parse(localStorage.getItem('win_docs')||'[]');
  wOpen_notepad(files[i]);
};

// ── メモ帳 ──
window.wOpen_notepad = function(file) {
  var uid='np'+Date.now();
  var content=file?file.body:'';
  var fname=file?file.name:'無題';
  var html='<div style="height:100%;display:flex;flex-direction:column">'+
    '<textarea id="'+uid+'" style="flex:1;border:none;outline:none;resize:none;font-family:\'Courier New\',monospace;font-size:13px;padding:4px;line-height:1.6;color:#000;background:#fff;tab-size:4" spellcheck="false">'+content+'</textarea>'+
  '</div>';
  _wCreate(uid,'メモ帳 - '+fname,'📄',html,520,380);
  _wSetMenu(uid,[
    {label:'ファイル',items:[
      {label:'新規(N)',fn:'_wNotepadNew_'+uid},
      {label:'保存(S)',fn:'_wNotepadSave_'+uid},
      '---',
      {label:'閉じる',fn:'_wCloseFromMenu'}
    ]},
    {label:'編集',items:['元に戻す','---','切り取り','コピー','貼り付け','すべて選択','---','日付と時刻']},
    {label:'書式',items:['右端で折り返す','フォント...']},
    {label:'ヘルプ',items:['バージョン情報...']},
  ]);
  window['_wNotepadNew_'+uid]=function(){ document.getElementById(uid).value=''; };
  window['_wNotepadSave_'+uid]=function(){
    var txt=document.getElementById(uid)?.value||'';
    var files=JSON.parse(localStorage.getItem('win_docs')||'[]');
    var name=prompt('ファイル名',fname)||fname;
    var idx=files.findIndex(function(f){return f.name===name;});
    if(idx>=0) files[idx].body=txt; else files.push({name,body:txt});
    localStorage.setItem('win_docs',JSON.stringify(files));
    _wRenderDocs();
    document.getElementById('wst-'+uid).textContent=name+'.txt を保存しました';
  };
};

// ── インターネットExplorer ──
window.wOpen_ie = function() {
  var html='<div style="display:flex;flex-direction:column;height:100%;background:#fff">'+
    // ツールバー
    '<div style="background:linear-gradient(180deg,#e8e8e8,#d0d0d0);padding:4px 6px;display:flex;align-items:center;gap:4px;border-bottom:1px solid #aaa">'+
      '<button class="wie-btn" onclick="document.getElementById(\'ie-f\').contentWindow.history.back()">◀ 戻る</button>'+
      '<button class="wie-btn" onclick="document.getElementById(\'ie-f\').contentWindow.history.forward()">▶ 進む</button>'+
      '<button class="wie-btn" onclick="document.getElementById(\'ie-f\').contentWindow.location.reload()">↺ 更新</button>'+
      '<button class="wie-btn" onclick="document.getElementById(\'ie-f\').src=\'about:blank\';document.getElementById(\'ie-u\').value=\'\'">🏠</button>'+
      '<span style="font-size:11px;color:#555;margin-left:4px">アドレス(D):</span>'+
      '<div style="flex:1;display:flex;align-items:center;background:white;border:2px inset #aaa;padding:2px 8px;margin:0 4px">'+
        '<input id="ie-u" style="flex:1;border:none;outline:none;font-size:12px;font-family:Arial" placeholder="URLを入力してEnterキーを押してください" onkeydown="if(event.key===\'Enter\')ieNav(this.value)">'+
      '</div>'+
      '<button class="wie-btn" onclick="ieNav(document.getElementById(\'ie-u\').value)" style="padding:2px 12px">移動(G) →</button>'+
    '</div>'+
    // リンクバー
    '<div style="background:#d8e4f8;padding:2px 8px;font-size:11px;border-bottom:1px solid #b0c0d8;display:flex;gap:14px;align-items:center">'+
      '<span style="color:#555">リンク(L):</span>'+
      ['MSN','Google','Wikipedia','Yahoo! JAPAN','YouTube'].map(function(s,i){
        var urls=['https://www.msn.com','https://www.google.com/webhp?igu=1','https://ja.wikipedia.org','https://www.yahoo.co.jp','https://www.youtube.com'];
        return '<span onclick="ieNav(\''+urls[i]+'\')" style="color:#00008b;cursor:pointer;text-decoration:underline;font-size:11px">'+s+'</span>';
      }).join('')+
    '</div>'+
    // フレーム
    '<iframe id="ie-f" style="flex:1;border:none" src="about:blank"></iframe>'+
    // ステータスバー
    '<div style="background:linear-gradient(180deg,#d0d0d0,#b8b8b8);padding:2px 8px;font-size:11px;color:#444;display:flex;justify-content:space-between;border-top:1px solid #aaa">'+
      '<span id="ie-status">完了</span><span>🌐 インターネット | 保護モード: オフ</span>'+
    '</div>'+
  '</div>';
  _wCreate('ie','Internet Explorer','🌐',html,820,560);
  _wSetMenu('ie',[
    {label:'ファイル',items:['新しいウィンドウ(N)','---','印刷(P)...','---',{label:'閉じる',fn:'_wCloseFromMenu'}]},
    {label:'編集',items:['切り取り','コピー','貼り付け','---','すべて選択','---','検索(F)...']},
    {label:'表示',items:['ツールバー','---','ソースの表示(C)','---','全画面表示(F11)']},
    {label:'お気に入り',items:['お気に入りに追加...','---','MSN','Google']},
    {label:'ツール',items:['インターネット オプション(O)...']},
    {label:'ヘルプ',items:['バージョン情報(A)...']},
  ]);
  // スタイル注入
  var st=document.createElement('style'); st.textContent='.wie-btn{background:linear-gradient(180deg,#f0f0f0,#d8d8d8);border:2px outset #fff;padding:2px 8px;font-size:11px;cursor:pointer;border-radius:2px;}.wie-btn:hover{filter:brightness(1.05)}.wie-btn:active{border:2px inset #aaa}'; document.head.appendChild(st);
  window.ieNav=function(url){
    if(!url.trim())return;
    if(!url.startsWith('http')) url=url.includes('.')&&!url.includes(' ')?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url);
    document.getElementById('ie-f').src=url;
    document.getElementById('ie-u').value=url;
    document.getElementById('ie-status').textContent='ページを読み込んでいます...';
    document.getElementById('ie-f').onload=function(){ document.getElementById('ie-status').textContent='完了'; };
  };
};

// ── ペイント ──
window.wOpen_paint = function() {
  var colors=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#C0C0C0','#ffffff','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff8040','#804000','#004040','#0080ff'];
  var palette=colors.map(function(c){return '<div onclick="window._wpC=\''+c+'\';document.getElementById(\'wp-cur\').style.background=\''+c+'\'" style="width:18px;height:18px;background:'+c+';cursor:pointer;border:1px solid #808080;box-sizing:border-box" title="'+c+'"></div>';}).join('');
  var tools=[['✏️','pen'],['📤','eraser'],['🪣','fill'],['╱','line'],['⬜','rect'],['⭕','ellipse'],['A','text']];
  var toolBtns=tools.map(function(t){return '<button onclick="window._wpT=\''+t[1]+'\'" title="'+t[1]+'" style="width:26px;height:26px;background:linear-gradient(180deg,#f0f0f0,#d0d0d0);border:1px solid #808080;cursor:pointer;border-radius:2px;font-size:13px;display:flex;align-items:center;justify-content:center;padding:0">'+t[0]+'</button>';}).join('');
  var html='<div style="display:flex;flex-direction:column;height:100%;background:#c0c0c0">'+
    // ツールバー
    '<div style="background:#c0c0c0;border-bottom:1px solid #808080;padding:2px 4px;display:flex;align-items:center;gap:4px">'+
      '<span style="font-size:11px">太さ:</span>'+
      '<input type="range" id="wp-sz" min="1" max="40" value="3" style="width:70px;accent-color:#0078d4">'+
      '<span style="font-size:11px">色:</span>'+
      '<div id="wp-cur" style="width:22px;height:22px;background:#000;border:2px solid #808080;margin-right:4px"></div>'+
      '<button onclick="var c=document.getElementById(\'wp-cv\');c.getContext(\'2d\').fillStyle=\'#fff\';c.getContext(\'2d\').fillRect(0,0,c.width,c.height)" style="font-size:11px;padding:2px 8px;border:1px solid #808080;background:#c0c0c0;cursor:pointer;border-radius:2px">全消し</button>'+
      '<button onclick="var a=document.createElement(\'a\');a.href=document.getElementById(\'wp-cv\').toDataURL();a.download=\'drawing.png\';a.click()" style="font-size:11px;padding:2px 8px;border:1px solid #808080;background:#c0c0c0;cursor:pointer;border-radius:2px">💾 保存</button>'+
    '</div>'+
    '<div style="display:flex;flex:1;overflow:hidden">'+
      // ツールボックス
      '<div style="width:32px;background:#c0c0c0;border-right:1px solid #808080;padding:3px 2px;display:flex;flex-direction:column;gap:2px;align-items:center">'+toolBtns+'</div>'+
      // キャンバス
      '<div style="flex:1;overflow:auto;background:#808080;display:flex;align-items:flex-start;justify-content:flex-start;padding:8px">'+
        '<canvas id="wp-cv" width="680" height="460" style="background:white;cursor:crosshair;display:block;box-shadow:2px 2px 4px rgba(0,0,0,.4)"></canvas>'+
      '</div>'+
    '</div>'+
    // パレット
    '<div style="height:28px;display:flex;align-items:center;gap:1px;padding:4px;border-top:1px solid #808080;background:#c0c0c0;overflow:hidden">'+
      palette+
    '</div>'+
  '</div>';
  _wCreate('paint','ペイント','🎨',html,780,540);
  _wSetMenu('paint',[
    {label:'ファイル',items:['新規(N)',{label:'名前をつけて保存',fn:''},{label:'---'},{label:'閉じる',fn:'_wCloseFromMenu'}]},
    {label:'編集',items:['元に戻す','---','すべて選択']},
    {label:'イメージ',items:['左右反転','上下反転','---','拡大縮小...']},
    {label:'色',items:['色の編集...']},
  ]);
  window._wpC='#000'; window._wpT='pen';
  setTimeout(function(){
    var cv=document.getElementById('wp-cv'); if(!cv)return;
    var cx=cv.getContext('2d');
    var drawing=false,lx=0,ly=0,sx=0,sy=0,snap=null;
    var getSize=function(){return parseInt(document.getElementById('wp-sz')?.value)||3;};
    cv.onmousedown=function(e){
      drawing=true; lx=e.offsetX; ly=e.offsetY; sx=e.offsetX; sy=e.offsetY;
      if(window._wpT==='pen'||window._wpT==='eraser'){ cx.beginPath(); cx.moveTo(lx,ly); }
      if(window._wpT==='line'||window._wpT==='rect'||window._wpT==='ellipse') snap=cx.getImageData(0,0,cv.width,cv.height);
      if(window._wpT==='fill'){ _wFloodFill(cx,cv,e.offsetX,e.offsetY,window._wpC); drawing=false; }
      if(window._wpT==='text'){
        var txt=prompt('テキストを入力'); if(!txt)return;
        cx.font=getSize()*4+'px Arial'; cx.fillStyle=window._wpC; cx.fillText(txt,e.offsetX,e.offsetY); drawing=false;
      }
    };
    cv.onmousemove=function(e){
      if(!drawing)return; var s=getSize();
      if(window._wpT==='pen'){ cx.lineWidth=s; cx.strokeStyle=window._wpC; cx.lineCap='round'; cx.lineJoin='round'; cx.lineTo(e.offsetX,e.offsetY); cx.stroke(); lx=e.offsetX; ly=e.offsetY; }
      else if(window._wpT==='eraser'){ cx.lineWidth=s*3; cx.strokeStyle='#fff'; cx.lineCap='round'; cx.lineTo(e.offsetX,e.offsetY); cx.stroke(); }
      else if(snap){
        cx.putImageData(snap,0,0);
        cx.strokeStyle=window._wpC; cx.lineWidth=s;
        if(window._wpT==='line'){ cx.beginPath(); cx.moveTo(sx,sy); cx.lineTo(e.offsetX,e.offsetY); cx.stroke(); }
        else if(window._wpT==='rect'){ cx.strokeRect(sx,sy,e.offsetX-sx,e.offsetY-sy); }
        else if(window._wpT==='ellipse'){ cx.beginPath(); cx.ellipse(sx+(e.offsetX-sx)/2,sy+(e.offsetY-sy)/2,Math.abs(e.offsetX-sx)/2,Math.abs(e.offsetY-sy)/2,0,0,Math.PI*2); cx.stroke(); }
      }
    };
    cv.onmouseup=function(){ drawing=false; snap=null; cx.closePath(); };
  },80);
};
window._wFloodFill=function(cx,cv,x,y,fillColor){
  var imgData=cx.getImageData(0,0,cv.width,cv.height);
  var d=imgData.data,w=cv.width,h=cv.height;
  var pos=(Math.round(y)*w+Math.round(x))*4;
  var sr=d[pos],sg=d[pos+1],sb=d[pos+2];
  var fc=parseInt(fillColor.slice(1),16);
  var fr=(fc>>16)&255,fg=(fc>>8)&255,fb=fc&255;
  if(sr===fr&&sg===fg&&sb===fb) return;
  var stack=[[Math.round(x),Math.round(y)]];
  while(stack.length){
    var p=stack.pop();var px=p[0],py=p[1];
    if(px<0||px>=w||py<0||py>=h) continue;
    var i=(py*w+px)*4;
    if(d[i]!==sr||d[i+1]!==sg||d[i+2]!==sb) continue;
    d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;
    stack.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
  }
  cx.putImageData(imgData,0,0);
};

// ── 電卓 ──
window.wOpen_calc = function() {
  var html='<div style="background:#c0c0c0;padding:8px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:4px">'+
    '<div id="wc-h" style="background:#e8e8e8;border:1px inset #aaa;padding:2px 8px;font-size:11px;color:#666;min-height:16px;font-family:Courier New;text-align:right"></div>'+
    '<div id="wc-d" style="background:white;border:2px inset #808080;padding:4px 10px;text-align:right;font-size:24px;font-family:Courier New,monospace;min-height:38px;color:#000">0</div>'+
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-top:4px">'+
      ['MC','MR','MS','M+','M-','←','CE','C','+/-','√',
       '7','8','9','DEL','÷','4','5','6','×','%',
       '1','2','3','-','1/x','0','0','.','+',' '].map(function(k,i){
        var sp=k==='0'&&i===25?'grid-column:span 2':'';
        var color=i<5?'#ddd':i<10?'#fcc':i===14||i===19||i===24?'#cce':'#f5f5f5';
        var textColor=i===14||i===19||i===24?'#005':'#222';
        return '<button onclick="wCalcKey(\''+k+'\')" style="'+sp+';background:linear-gradient(180deg,'+color+','+shadeColor(color,-15)+');border:1px solid #808080;border-bottom:2px solid #606060;border-right:2px solid #606060;padding:5px 2px;font-size:13px;cursor:pointer;font-family:Segoe UI,Tahoma;border-radius:2px;color:'+textColor+'">'+k+'</button>';
      }).join('')+
      '<button onclick="wCalcKey(\'=\')" style="grid-column:span 1;background:linear-gradient(180deg,#1a6fc4,#0a4a9a);border:1px solid #808080;border-bottom:2px solid #606060;border-right:2px solid #606060;padding:5px 2px;font-size:14px;font-weight:700;cursor:pointer;border-radius:2px;color:white">=</button>'+
    '</div>'+
  '</div>';
  _wCreate('calc','電卓','🧮',html,270,340);
  _wSetMenu('calc',[{label:'表示',items:['標準電卓(T)','関数電卓(S)']},{label:'編集',items:['コピー(C)','貼り付け(P)']},{label:'ヘルプ',items:['バージョン情報(A)...']}]);
  var disp='0',prev=null,op=null,rst=false;
  window.wCalcKey=function(k){
    var d=document.getElementById('wc-d'),h=document.getElementById('wc-h');if(!d)return;
    if(k==='C'){disp='0';prev=null;op=null;rst=false;if(h)h.textContent='';}
    else if(k==='CE'){disp='0';}
    else if(k==='←'){disp=disp.length>1?disp.slice(0,-1):'0';}
    else if(k==='+/-'){disp=String(-parseFloat(disp)||0);}
    else if(k==='√'){disp=String(Math.sqrt(parseFloat(disp)));if(h)h.textContent='√('+disp+')';}
    else if(k==='1/x'){var v=parseFloat(disp);disp=v?String(1/v):'Err';}
    else if(k==='%'){disp=String(parseFloat(disp)/100);}
    else if(k==='MC'){_wMem=0;}else if(k==='MR'){disp=String(_wMem);}else if(k==='MS'){_wMem=parseFloat(disp);}else if(k==='M+'){_wMem+=parseFloat(disp);}else if(k==='M-'){_wMem-=parseFloat(disp);}
    else if(k==='DEL'){disp=disp.length>1?disp.slice(0,-1):'0';}
    else if(['÷','×','-','+'].includes(k)){prev=parseFloat(disp);op=k;rst=true;if(h)h.textContent=disp+' '+k;}
    else if(k==='='){
      if(prev===null||!op)return;
      var cur=parseFloat(disp);
      var ops={'÷':function(a,b){return b?a/b:'エラー';},'×':function(a,b){return a*b;},'-':function(a,b){return a-b;},'+':function(a,b){return a+b;}};
      var r=ops[op]?ops[op](prev,cur):0;
      if(h)h.textContent=prev+' '+op+' '+cur+' =';
      if(typeof r==='number') r=parseFloat(r.toPrecision(12));
      disp=String(r);prev=null;op=null;rst=true;
    }
    else if(k==='.'){if(!disp.includes('.'))disp+='.'; }
    else if(k===' '){}
    else{if(rst){disp=k;rst=false;}else disp=disp==='0'?k:disp+k;}
    d.textContent=disp;
  };
};
function shadeColor(c,n){return c;}

// ── コマンドプロンプト ──
window.wOpen_cmd = function() {
  var html='<div style="background:#000;color:#c0c0c0;font-family:Courier New,monospace;font-size:13px;display:flex;flex-direction:column;height:100%">'+
    '<div id="wcmd-out" style="flex:1;overflow-y:auto;padding:6px 8px;white-space:pre-wrap;word-break:break-all;line-height:1.5"></div>'+
    '<div style="display:flex;align-items:center;padding:0 8px 6px;gap:4px">'+
      '<span id="wcmd-prompt" style="color:#c0c0c0;white-space:nowrap;font-size:13px">C:\\Users\\ゲスト&gt;</span>'+
      '<input id="wcmd-in" style="flex:1;background:transparent;border:none;outline:none;color:#c0c0c0;font-family:Courier New,monospace;font-size:13px;caret-color:#c0c0c0" autocomplete="off" onkeydown="wCmdKey(event)">'+
    '</div>'+
  '</div>';
  _wCreate('cmd','コマンド プロンプト','🖤',html,620,400);
  _wSetMenu('cmd',[{label:'ファイル',items:['新しいタブ(T)','プロパティ(P)','---',{label:'閉じる',fn:'_wCloseFromMenu'}]},{label:'編集',items:['マーク(K)','コピー(Y)','貼り付け(P)','すべて選択(A)']},{label:'表示',items:['全画面表示(F5)']},{label:'ヘルプ',items:['バージョン情報(A)...']}]);
  var out=document.getElementById('wcmd-out');
  var cwd='C:\\Users\\ゲスト',hist=[],hi=0;
  var p=function(t,c){ var d=document.createElement('div'); d.style.color=c||'#c0c0c0'; d.textContent=t; out.appendChild(d); out.scrollTop=out.scrollHeight; };
  p('Microsoft Windows XP [Version 5.1.2600]'); p('(C) Copyright 1985-2001 Microsoft Corp.'); p('');
  var cmds={
    help:function(){['cd [パス]','dir','cls','echo [テキスト]','ver','date','time','ipconfig','systeminfo','tasklist','tree','type [ファイル]','mkdir [名前]','start [アプリ]','color','exit'].forEach(function(c){p('  '+c);});},
    ver:function(){p('Microsoft Windows XP [Version 5.1.2600]');},
    cls:function(){out.innerHTML='';},
    date:function(){p('現在の日付: '+new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'}));},
    time:function(){p('現在の時刻: '+new Date().toLocaleTimeString('ja-JP'));},
    exit:function(){wClose('cmd');},
    ipconfig:function(){p('Windows IP 設定\n\nイーサネット アダプタ ローカル エリア接続:\n   接続固有の DNS サフィックス: \n   IP アドレス . . . . : 192.168.1.100\n   サブネット マスク . : 255.255.255.0\n   デフォルト ゲートウェイ: 192.168.1.1');},
    systeminfo:function(){p('ホスト名:               UTILOHUB-PC\nOS 名:                 Microsoft Windows XP Professional\nOS バージョン:          5.1.2600 Service Pack 3\n製造元:                UtiloHub Virtual Machine\nプロセッサ:             x86 Family 6, ~2400 MHz\n物理メモリの合計:        1,024 MB\n利用可能な物理メモリ:    512 MB\nページ ファイルの最大サイズ: 2,048 MB');},
    tasklist:function(){p('イメージ名           PID  セッション  メモリ使用量\n================== ===== ========== ============\nSystem                 4  Console         256 K\nexplorer.exe         832  Console      28,540 K\niexplore.exe        1024  Console      45,200 K\nnotepad.exe         1200  Console       5,332 K\ncmd.exe             1400  Console       4,096 K\nutilohub.exe        2000  Console      64,512 K');},
    tree:function(){p('フォルダー パスの一覧: ボリューム ローカルディスク\nC:\\Users\\ゲスト\n├─ デスクトップ\n├─ ドキュメント\n│  └─ メモ.txt\n├─ ダウンロード\n├─ ミュージック\n└─ ピクチャ');},
    color:function(){p('COLORコマンド\n使用法: COLOR [bf]\nb = 背景色, f = 前景色 (0-F)');},
    dir:function(){p(' ドライブ C のボリューム ラベルは UTILOHUB です\n ボリューム シリアル番号は 1A2B-3C4D です\n\n'+cwd+' のディレクトリ\n\n2024/04/01  09:00    <DIR>          .\n2024/04/01  09:00    <DIR>          ..\n2024/04/01  10:00    <DIR>          デスクトップ\n2024/04/01  10:00    <DIR>          ドキュメント\n2024/04/01  10:00    <DIR>          ダウンロード\n               0 個のファイル              0 バイト\n               3 個のディレクトリ  63,345,234,432 バイトの空き領域');},
  };
  window.wCmdKey=function(e){
    var inp=document.getElementById('wcmd-in'); if(!e||!inp)return;
    if(e.key==='Enter'){
      var raw=inp.value.trim(); p(cwd+'>'+raw); hist.unshift(raw); hi=0;
      if(!raw){inp.value='';return;}
      var parts=raw.toLowerCase().split(/\s+/);
      var cmd=parts[0];
      if(cmd==='echo'){p(raw.substring(5)||'');}
      else if(cmd==='cd'){
        if(!parts[1]){p(cwd);}
        else if(parts[1]==='..'){cwd=cwd.split('\\').slice(0,-1).join('\\')||'C:';document.getElementById('wcmd-prompt').textContent=cwd+'>';}
        else{cwd=cwd+'\\'+parts[1];document.getElementById('wcmd-prompt').textContent=cwd+'>';}
      }
      else if(cmd==='mkdir'||cmd==='md'){p(parts[1]?'ディレクトリが作成されました: '+parts[1]:'コマンドの構文が正しくありません。');}
      else if(cmd==='start'){
        var app=parts[1];
        if(!app){p('使用法: start [アプリ名]');}
        else if(app==='notepad'||app==='notepad.exe'){wOpen_notepad();p('メモ帳を起動しました');}
        else if(app==='calc'||app==='calc.exe'){wOpen_calc();p('電卓を起動しました');}
        else if(app==='mspaint'||app==='paint'){wOpen_paint();p('ペイントを起動しました');}
        else if(app==='iexplore'||app==='ie'){wOpen_ie();p('Internet Explorerを起動しました');}
        else if(app==='explorer'){wOpen_mypc();p('エクスプローラを起動しました');}
        else{p('\''+app+'\' は認識されていません。','#ff4444');}
      }
      else if(cmds[cmd]){cmds[cmd]();}
      else{p('\''+cmd+'\' は、内部コマンドまたは外部コマンド、\n操作可能なプログラムまたはバッチ ファイルとして認識されていません。','#ff4444');}
      inp.value='';
    }
    else if(e.key==='ArrowUp'){if(hi<hist.length)inp.value=hist[hi++];}
    else if(e.key==='ArrowDown'){hi=Math.max(0,hi-1);inp.value=hist[hi]||'';}
    else if(e.key==='Tab'){e.preventDefault();}
  };
  setTimeout(function(){document.getElementById('wcmd-in')?.focus();},100);
};

// ── Media Player ──
window.wOpen_media = function() {
  var tracks=[{t:'Windows XP起動音',a:'Microsoft',d:'0:05'},{t:'田園',a:'ベートーヴェン',d:'3:45'},{t:'月の光',a:'ドビュッシー',d:'5:12'},{t:'ノクターン Op.9 No.2',a:'ショパン',d:'4:33'}];
  var list=tracks.map(function(t,i){return '<div onclick="wmpPlay('+i+')" style="display:flex;align-items:center;gap:10px;padding:6px 10px;cursor:pointer;border-bottom:1px solid #2a2a2a" onmouseover="this.style.background=\'#2a2a4a\'" onmouseout="this.style.background=\'\'" id="wmp-tr-'+i+'"><span style="color:#888;font-size:11px;width:20px;text-align:right">'+（i+1）+'</span><div style="flex:1"><div style="font-size:13px;color:#ddd">'+t.t+'</div><div style="font-size:11px;color:#888">'+t.a+'</div></div><span style="font-size:11px;color:#888">'+t.d+'</span></div>';}).join('');
  var html='<div style="display:flex;flex-direction:column;height:100%;background:#1a1a2e">'+
    '<div style="flex:1;display:flex">'+
      // ビジュアライザ
      '<div style="flex:1;background:#0d0d1a;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">'+
        '<canvas id="wmp-vis" width="300" height="120" style="display:block"></canvas>'+
        '<div id="wmp-info" style="text-align:center;margin-top:10px"><div id="wmp-title" style="font-size:16px;color:#ddd">Windows Media Player</div><div id="wmp-artist" style="font-size:12px;color:#888">曲を選択してください</div></div>'+
      '</div>'+
      // プレイリスト
      '<div style="width:220px;background:#111118;border-left:1px solid #333;overflow-y:auto">'+
        '<div style="padding:6px 10px;font-size:10px;font-weight:700;color:#666;text-transform:uppercase;border-bottom:1px solid #2a2a2a">プレイリスト</div>'+
        list+
      '</div>'+
    '</div>'+
    // コントロール
    '<div style="background:#111118;border-top:1px solid #333;padding:10px 14px">'+
      '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px">'+
        '<span id="wmp-cur" style="font-size:11px;color:#888">0:00</span>'+
        '<input type="range" id="wmp-seek" min="0" max="100" value="0" style="flex:1;accent-color:#0078d4">'+
        '<span id="wmp-dur" style="font-size:11px;color:#888">0:00</span>'+
        '<span style="font-size:11px;color:#888;margin-left:8px">🔊</span>'+
        '<input type="range" id="wmp-vol" min="0" max="100" value="70" style="width:60px;accent-color:#0078d4">'+
      '</div>'+
      '<div style="display:flex;justify-content:center;gap:8px">'+
        '<button onclick="wmpPrev()" style="background:#2a2a3a;border:1px solid #444;color:#ccc;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px">⏮</button>'+
        '<button onclick="wmpToggle()" id="wmp-play-btn" style="background:#0078d4;border:none;color:white;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:18px">▶</button>'+
        '<button onclick="wmpNext()" style="background:#2a2a3a;border:1px solid #444;color:#ccc;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px">⏭</button>'+
        '<button onclick="wmpStop()" style="background:#2a2a3a;border:1px solid #444;color:#ccc;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px">⏹</button>'+
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('media','Windows Media Player','🎵',html,580,440);
  _wSetMenu('media',[{label:'ファイル',items:['ファイルを開く(O)...','---',{label:'閉じる',fn:'_wCloseFromMenu'}]},{label:'表示',items:['フル スクリーン(F)','---','ビジュアライゼーション']},{label:'ヘルプ',items:['バージョン情報(A)...']}]);
  // ビジュアライザアニメ
  setTimeout(function(){
    var cv=document.getElementById('wmp-vis'); if(!cv)return;
    var cx=cv.getContext('2d');
    var bars=32,playing=false;
    window._wmpPlaying=function(){return playing;};
    window._wmpSetPlaying=function(v){playing=v;};
    function drawVis(){
      requestAnimationFrame(drawVis);
      cx.fillStyle='#0d0d1a'; cx.fillRect(0,0,cv.width,cv.height);
      if(!playing){cx.fillStyle='rgba(0,120,212,.3)';cx.fillRect(cv.width/2-1,0,2,cv.height);return;}
      var bw=cv.width/bars-2;
      for(var i=0;i<bars;i++){
        var h=playing?(Math.random()*cv.height*.8+10):5;
        var hue=200+i*3;
        cx.fillStyle='hsla('+hue+',80%,60%,.9)';
        cx.fillRect(i*(bw+2),cv.height-h,bw,h);
      }
    }
    drawVis();
    var cur=0;
    window.wmpPlay=function(i){
      cur=i; playing=true; window._wmpSetPlaying(true);
      document.getElementById('wmp-play-btn').textContent='⏸';
      var t=tracks[i];
      document.getElementById('wmp-title').textContent=t.t;
      document.getElementById('wmp-artist').textContent=t.a;
      document.getElementById('wmp-dur').textContent=t.d;
      document.querySelectorAll('[id^="wmp-tr-"]').forEach(function(x){x.style.background='';});
      var tr=document.getElementById('wmp-tr-'+i); if(tr)tr.style.background='rgba(0,120,212,.3)';
      document.getElementById('wmp-seek').value=0;
      // フェイクシーク
      clearInterval(window._wmpIv);
      var pct=0;
      window._wmpIv=setInterval(function(){
        if(!window._wmpPlaying()){return;}
        pct=Math.min(pct+0.5,100);
        var el=document.getElementById('wmp-seek'); if(el)el.value=pct;
        var parts=t.d.split(':');var total=parseInt(parts[0])*60+parseInt(parts[1]);
        var elapsed=Math.floor(total*pct/100);
        var el2=document.getElementById('wmp-cur'); if(el2)el2.textContent=Math.floor(elapsed/60)+':'+(elapsed%60<10?'0':'')+elapsed%60;
        if(pct>=100){clearInterval(window._wmpIv);wmpNext();}
      },300);
    };
    window.wmpToggle=function(){
      playing=!playing; window._wmpSetPlaying(playing);
      document.getElementById('wmp-play-btn').textContent=playing?'⏸':'▶';
    };
    window.wmpStop=function(){
      playing=false;window._wmpSetPlaying(false);
      clearInterval(window._wmpIv);
      document.getElementById('wmp-play-btn').textContent='▶';
      document.getElementById('wmp-seek').value=0;
      document.getElementById('wmp-cur').textContent='0:00';
    };
    window.wmpNext=function(){ wmpPlay((cur+1)%tracks.length); };
    window.wmpPrev=function(){ wmpPlay((cur-1+tracks.length)%tracks.length); };
  },100);
};

// ── コントロールパネル ──
window.wOpen_control = function() {
  var items=[
    {ic:'🖥',name:'画面',desc:'解像度・色・テーマ',fn:'alert("画面プロパティ")'},
    {ic:'🔊',name:'サウンド',desc:'音量・効果音',fn:'alert("サウンドとオーディオ デバイスのプロパティ")'},
    {ic:'🖨',name:'プリンタ',desc:'プリンタの追加',fn:'wOpen_printers()'},
    {ic:'🌐',name:'インターネット',desc:'IE の設定',fn:'wOpen_ie()'},
    {ic:'⌨️',name:'キーボード',desc:'入力速度・言語',fn:'alert("キーボードのプロパティ")'},
    {ic:'🖱',name:'マウス',desc:'ポインタ・速度',fn:'alert("マウスのプロパティ")'},
    {ic:'📅',name:'日付と時刻',desc:'タイムゾーン設定',fn:'alert("日付と時刻のプロパティ\\n現在: "+new Date().toLocaleString("ja-JP"))'},
    {ic:'🔒',name:'セキュリティ',desc:'ファイアウォール',fn:'alert("Windows ファイアウォール: 有効")'},
    {ic:'💾',name:'システム',desc:'ハードウェア・詳細',fn:'alert("システムのプロパティ\\nWindows XP Professional\\nバージョン 2002 SP3\\nRAM: 1024MB")'},
    {ic:'🌈',name:'アクセシビリティ',desc:'文字・コントラスト',fn:'alert("ユーザー補助のオプション")'},
    {ic:'🔧',name:'プログラムの追加',desc:'ソフトウェア管理',fn:'alert("プログラムの追加と削除")'},
    {ic:'👤',name:'ユーザー アカウント',desc:'アカウント管理',fn:'alert("ユーザー アカウント\\n現在: '+(localStorage.getItem('uh2_setup_name')||'ゲスト')+'")'},
  ];
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:4px 0 6px;text-transform:uppercase">コントロール パネル</div>'+
      '<div class="wexp-link" onclick="alert(\'クラシック表示に切り替え\')">🔀 クラシック表示</div>'+
      '<div class="wexp-link" onclick="alert(\'ヘルプ\')">❓ ヘルプ</div>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto">'+
      '<div style="display:flex;flex-wrap:wrap;gap:10px">'+
        items.map(function(it){
          return '<div onclick="'+it.fn+'" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;width:90px;cursor:pointer;border-radius:6px;text-align:center;border:1px solid transparent;transition:all .1s" onmouseover="this.style.background=\'#d8e4f8\';this.style.border=\'1px solid #7098d0\'" onmouseout="this.style.background=\'\';this.style.border=\'1px solid transparent\'">'+
            '<span style="font-size:36px">'+it.ic+'</span>'+
            '<div style="font-size:11px;font-weight:600;color:#000">'+it.name+'</div>'+
            '<div style="font-size:10px;color:#666;line-height:1.3">'+it.desc+'</div>'+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('control','コントロール パネル','⚙️',html,660,460);
  _wSetMenu('control',[{label:'ファイル',items:['---',{label:'閉じる',fn:'_wCloseFromMenu'}]},{label:'表示',items:['カテゴリの表示','クラシック表示']},{label:'ヘルプ',items:['ヘルプとサポート']}]);
  _addExpStyle();
};

// ── プリンタ ──
window.wOpen_printers = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div class="wexp-link" onclick="alert(\'プリンタの追加ウィザード\')">➕ プリンタの追加</div>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto">'+
      '<div style="display:flex;gap:10px">'+
        '<div ondblclick="alert(\'Microsoft XPS Document Writer\\n状態: 準備完了\')" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;width:90px;cursor:pointer;border-radius:4px" onmouseover="this.style.background=\'#d8e4f8\'" onmouseout="this.style.background=\'\'"><span style="font-size:36px">🖨</span><div style="font-size:11px;text-align:center">Microsoft XPS Document Writer</div></div>'+
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('printers','プリンタと FAX','🖨',html,560,380);
  _addExpStyle();
};

// ── 検索 ──
window.wOpen_search = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:200px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:12px">'+
      '<div style="font-size:22px;text-align:center;margin-bottom:8px">🐶</div>'+
      '<div style="font-size:12px;font-weight:600;margin-bottom:10px">検索コンパニオン</div>'+
      '<div style="margin-bottom:8px"><div style="font-size:11px;margin-bottom:4px">ファイル名の一部または全部:</div><input id="wsrch-q" style="width:100%;border:2px inset #aaa;padding:3px;font-size:12px;box-sizing:border-box" placeholder="例: *.txt"></div>'+
      '<div style="margin-bottom:8px"><div style="font-size:11px;margin-bottom:4px">含まれる文字列:</div><input id="wsrch-c" style="width:100%;border:2px inset #aaa;padding:3px;font-size:12px;box-sizing:border-box"></div>'+
      '<div style="margin-bottom:8px"><div style="font-size:11px;margin-bottom:4px">場所:</div><select style="width:100%;border:2px inset #aaa;padding:3px;font-size:11px"><option>ローカルディスク (C:)</option><option>マイドキュメント</option></select></div>'+
      '<button onclick="document.getElementById(\'wsrch-r\').innerHTML=\'<div style=\\\"padding:10px;color:#666\\\">検索結果: ファイルが見つかりません</div>\'" style="width:100%;background:linear-gradient(180deg,#f0f0f0,#d8d8d8);border:2px outset #fff;padding:4px;cursor:pointer;font-size:12px">🔍 検索(S)</button>'+
    '</div>'+
    '<div style="flex:1;padding:12px;overflow:auto"><div id="wsrch-r" style="color:#888;font-size:13px">検索条件を入力して「検索」をクリックしてください</div></div>'+
  '</div>';
  _wCreate('search','検索結果','🔍',html,600,420);
  _wSetMenu('search',[{label:'ファイル',items:['---',{label:'閉じる',fn:'_wCloseFromMenu'}]},{label:'表示',items:['ステータス バー']},{label:'ヘルプ',items:['ヘルプとサポート']}]);
  _addExpStyle();
};

// ── ヘルプ ──
window.wOpen_help = function() {
  var html='<div style="display:flex;flex-direction:column;height:100%;font-size:12px">'+
    '<div style="background:linear-gradient(180deg,#245edb,#1a48b8);padding:10px 14px;display:flex;align-items:center;gap:10px">'+
      '<span style="font-size:24px">❓</span>'+
      '<div style="color:white;font-size:14px;font-weight:700">Windows XP ヘルプとサポート センター</div>'+
    '</div>'+
    '<div style="flex:1;padding:16px;overflow:auto;background:#fff">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
        ['コンピュータの基本を学ぶ','ネットワークとインターネット','Windows XP の新機能','アカウントを管理する','セキュリティとプライバシー','パフォーマンスの向上'].map(function(t){
          return '<div onclick="alert(\''+t+'のヘルプはまだ準備中です\')" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #c0d0e0;border-radius:4px;cursor:pointer;background:#f0f4ff" onmouseover="this.style.background=\'#d8e8ff\'" onmouseout="this.style.background=\'#f0f4ff\'"><span style="font-size:20px">📖</span><span style="color:#245edb;font-size:12px">'+t+'</span></div>';
        }).join('')+
      '</div>'+
    '</div>'+
  '</div>';
  _wCreate('help','ヘルプとサポート','❓',html,600,440);
};

// ── マイピクチャ ──
window.wOpen_pics = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div class="wexp-link" onclick="wOpen_paint()">🎨 画像を編集する</div>'+
      '<div class="wexp-link" onclick="alert(\'印刷ウィザード\')">🖨 写真を印刷する</div>'+
    '</div>'+
    '<div style="flex:1;padding:20px;text-align:center;color:#888">ピクチャがありません</div>'+
  '</div>';
  _wCreate('pics','マイ ピクチャ','🖼',html,560,380);
  _addExpStyle();
};

// ── マイミュージック ──
window.wOpen_music = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div class="wexp-link" onclick="wOpen_media()">🎵 Media Playerで再生</div>'+
    '</div>'+
    '<div style="flex:1;padding:20px;text-align:center;color:#888">音楽ファイルがありません</div>'+
  '</div>';
  _wCreate('music','マイ ミュージック','🎵',html,560,380);
  _addExpStyle();
};

// ── ごみ箱 ──
window.wOpen_trash = function() {
  var html='<div style="display:flex;height:100%;font-size:12px">'+
    '<div style="width:160px;background:linear-gradient(180deg,#dce8fc,#c5d8f8);border-right:1px solid #aab8d8;padding:8px;flex-shrink:0">'+
      '<div class="wexp-link" onclick="alert(\'ごみ箱を空にしました\')">🗑 ごみ箱を空にする</div>'+
      '<div class="wexp-link" onclick="alert(\'復元するアイテムを選択してください\')">↩ 全ての項目を元に戻す</div>'+
      '<div style="font-size:10px;font-weight:700;color:#245edb;padding:10px 0 6px;text-transform:uppercase">その他の場所</div>'+
      '<div class="wexp-link" onclick="wOpen_mypc()">🖥 マイコンピュータ</div>'+
    '</div>'+
    '<div style="flex:1;padding:40px;text-align:center;color:#888;font-size:14px">🗑<br>ごみ箱は空です</div>'+
  '</div>';
  _wCreate('trash','ごみ箱','🗑',html,560,380);
  _addExpStyle();
};

// ── エクスプローラCSSを一度だけ追加 ──
window._expStyleAdded=false;
window._addExpStyle=function(){
  if(window._expStyleAdded) return;
  window._expStyleAdded=true;
  var st=document.createElement('style');
  st.textContent='.wexp-link{padding:3px 6px;cursor:pointer;color:#00008b;font-size:12px;border-radius:2px;}.wexp-link:hover{background:#316ac5;color:white;}';
  document.head.appendChild(st);
};

// ── 番号付けヘルパー ──
var と = function(n){ return n+1; };
