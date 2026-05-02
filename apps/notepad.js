// ===== Notepad App =====
export function openNotepad() {
  const notes = UH.ls.get('notes', [{ id: 1, title: '無題', body: '' }]);
  let activeNote = notes[0]?.id || 1;

  const render = () => {
    const n = notes.find(x => x.id === activeNote);
    document.getElementById('note-editor').value = n?.body || '';
    document.getElementById('note-title-input').value = n?.title || '';
    document.querySelectorAll('.note-item').forEach(el => {
      el.classList.toggle('selected', parseInt(el.dataset.id) === activeNote);
    });
  };

  const html = `
    <div style="display:flex;height:100%">
      <!-- Sidebar -->
      <div style="width:180px;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;">
        <div style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:6px">
          <button class="btn btn-primary" style="flex:1;padding:6px;font-size:11px"
            onclick="
              const id=Date.now();
              const notes=UH.ls.get('notes',[]);
              notes.push({id,title:'無題',body:''});
              UH.ls.set('notes',notes);
              window._notepad_active=id;
              UH.closeWindow('notepad');openNotepad();
            ">＋ 新規</button>
          <button class="btn btn-danger" style="padding:6px;font-size:11px"
            onclick="
              let notes=UH.ls.get('notes',[]);
              if(notes.length<=1){UH.notify('最後のノートは削除できません','⚠️','#f59e0b');return;}
              notes=notes.filter(n=>n.id!==window._notepad_active);
              UH.ls.set('notes',notes);
              window._notepad_active=notes[0].id;
              UH.closeWindow('notepad');openNotepad();
            ">🗑</button>
        </div>
        <div id="notes-list" style="flex:1;overflow-y:auto;padding:6px"></div>
      </div>
      <!-- Editor -->
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:center">
          <input id="note-title-input" class="input" style="flex:1;padding:6px 10px;font-size:13px;font-weight:600"
            placeholder="タイトル"
            onchange="
              const notes=UH.ls.get('notes',[]);
              const n=notes.find(x=>x.id===window._notepad_active);
              if(n){n.title=this.value;UH.ls.set('notes',notes);}
            "/>
          <button class="btn btn-success" style="padding:6px 14px;font-size:12px"
            onclick="UH.notify('保存しました','💾','#10b981')">💾 保存</button>
        </div>
        <textarea id="note-editor" class="input"
          style="flex:1;padding:16px;font-size:13px;line-height:1.8;resize:none;border:none;border-radius:0;background:transparent"
          placeholder="ここにメモを書く..."
          oninput="
            const notes=UH.ls.get('notes',[]);
            const n=notes.find(x=>x.id===window._notepad_active);
            if(n){n.body=this.value;UH.ls.set('notes',notes);}
          "></textarea>
        <div style="padding:6px 12px;font-size:11px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.05)" id="note-stats"></div>
      </div>
    </div>
  `;

  UH.createWindow('notepad', 'メモ帳', '📝', html, 620, 480);
  window._notepad_active = notes[0]?.id;

  // render notes list
  setTimeout(() => {
    const list = document.getElementById('notes-list');
    if (!list) return;
    const allNotes = UH.ls.get('notes', [{ id: 1, title: '無題', body: '' }]);
    list.innerHTML = allNotes.map(n => `
      <div class="file-item note-item ${n.id === activeNote ? 'selected' : ''}" data-id="${n.id}"
        onclick="window._notepad_active=${n.id};document.getElementById('note-editor').value='${n.body?.replace(/'/g,"\\'")||''}';document.getElementById('note-title-input').value='${n.title?.replace(/'/g,"\\'")||''}';document.querySelectorAll('.note-item').forEach(e=>e.classList.remove('selected'));this.classList.add('selected');">
        <span>📄</span>
        <span style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.title}</span>
      </div>`).join('');
    const editor = document.getElementById('note-editor');
    const stats = document.getElementById('note-stats');
    if (editor && stats) {
      const update = () => { const v=editor.value; stats.textContent=`${v.length} 文字 · ${v.split(/\n/).length} 行`; };
      editor.addEventListener('input', update); update();
      const first = allNotes[0];
      if (first) { editor.value = first.body||''; document.getElementById('note-title-input').value = first.title||''; }
    }
  }, 50);
}
window.openNotepad = openNotepad;
