// ===== Music Player App =====
export function openMusic() {
  const tracks = [
    { name: 'Creative Minds', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3', color: '#6366f1' },
    { name: 'Acoustic Breeze', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3', color: '#10b981' },
    { name: 'Sunny', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', color: '#f59e0b' },
    { name: 'Ukulele', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3', color: '#ec4899' },
    { name: 'Jazzy Frenchy', artist: 'Bensound', url: 'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3', color: '#8b5cf6' },
  ];

  const html = `
    <div style="display:flex;flex-direction:column;height:100%;padding:20px;gap:16px">
      <!-- Disc + info -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <div class="music-disc" id="music-disc" style="animation-play-state:paused"></div>
        <div style="text-align:center">
          <div id="track-name" style="font-size:16px;font-weight:700;color:white">Creative Minds</div>
          <div id="track-artist" style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px">Bensound</div>
        </div>
      </div>
      <!-- Progress -->
      <div>
        <input type="range" id="music-seek" min="0" max="100" value="0" style="width:100%;height:3px;accent-color:#6366f1;cursor:pointer">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px">
          <span id="music-cur">0:00</span><span id="music-dur">0:00</span>
        </div>
      </div>
      <!-- Controls -->
      <div style="display:flex;align-items:center;justify-content:center;gap:16px">
        <button class="btn btn-ghost" style="padding:10px;font-size:18px;border-radius:50%" onclick="musicPrev()">⏮</button>
        <button class="btn btn-primary" id="music-play-btn" style="padding:14px 20px;font-size:20px;border-radius:50%;width:54px;height:54px" onclick="musicToggle()">▶</button>
        <button class="btn btn-ghost" style="padding:10px;font-size:18px;border-radius:50%" onclick="musicNext()">⏭</button>
        <input type="range" id="music-vol" min="0" max="1" step="0.01" value="0.8" style="width:80px;height:3px;accent-color:#6366f1;cursor:pointer" oninput="if(window._musicAudio)window._musicAudio.volume=this.value">
        <span style="font-size:16px">🔊</span>
      </div>
      <!-- Playlist -->
      <div style="flex:1;overflow-y:auto">
        ${tracks.map((t,i)=>`
          <div class="file-item" id="track-item-${i}" onclick="musicSelect(${i})" style="justify-content:space-between">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:8px;height:8px;border-radius:50%;background:${t.color}"></div>
              <div>
                <div style="font-size:13px;font-weight:600">${t.name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4)">${t.artist}</div>
              </div>
            </div>
            <span id="playing-icon-${i}" style="display:none;color:${t.color};font-size:12px;animation:pulse 1s infinite">♫</span>
          </div>`).join('')}
      </div>
    </div>
  `;

  UH.createWindow('music', '音楽プレイヤー', '🎵', html, 320, 560);

  setTimeout(() => {
    if (!window._musicAudio) {
      window._musicAudio = new Audio(tracks[0].url);
      window._musicAudio.volume = 0.8;
      window._musicIdx = 0;
    }
    const audio = window._musicAudio;
    const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

    window.musicToggle = () => {
      const disc = document.getElementById('music-disc');
      const btn  = document.getElementById('music-play-btn');
      if (audio.paused) {
        audio.play();
        if (disc) disc.style.animationPlayState='running';
        if (btn)  btn.textContent='⏸';
        UH.notify('再生中: ' + tracks[window._musicIdx].name, '🎵', tracks[window._musicIdx].color);
      } else {
        audio.pause();
        if (disc) disc.style.animationPlayState='paused';
        if (btn)  btn.textContent='▶';
      }
    };
    window.musicSelect = i => {
      window._musicIdx = i;
      audio.src = tracks[i].url;
      audio.play();
      document.getElementById('music-disc').style.animationPlayState='running';
      document.getElementById('music-play-btn').textContent='⏸';
      document.getElementById('track-name').textContent = tracks[i].name;
      document.getElementById('track-artist').textContent = tracks[i].artist;
      document.querySelectorAll('[id^=playing-icon-]').forEach(e=>e.style.display='none');
      document.getElementById(`playing-icon-${i}`).style.display='inline';
      document.querySelectorAll('[id^=track-item-]').forEach(e=>e.classList.remove('selected'));
      document.getElementById(`track-item-${i}`).classList.add('selected');
    };
    window.musicNext = () => window.musicSelect((window._musicIdx+1)%tracks.length);
    window.musicPrev = () => window.musicSelect((window._musicIdx-1+tracks.length)%tracks.length);

    audio.ontimeupdate = () => {
      const seek = document.getElementById('music-seek');
      const cur  = document.getElementById('music-cur');
      const dur  = document.getElementById('music-dur');
      if (seek && !isNaN(audio.duration)) {
        seek.value = (audio.currentTime/audio.duration)*100;
        if (cur) cur.textContent = fmt(audio.currentTime);
        if (dur) dur.textContent = fmt(audio.duration);
      }
    };
    audio.onended = () => window.musicNext();
    const seek = document.getElementById('music-seek');
    if (seek) seek.oninput = () => { audio.currentTime = (seek.value/100)*audio.duration; };

    // restore state
    const i = window._musicIdx || 0;
    document.getElementById(`track-item-${i}`)?.classList.add('selected');
    document.getElementById('track-name').textContent = tracks[i].name;
    document.getElementById('track-artist').textContent = tracks[i].artist;
    if (!audio.paused) {
      document.getElementById('music-disc').style.animationPlayState='running';
      document.getElementById('music-play-btn').textContent='⏸';
      document.getElementById(`playing-icon-${i}`).style.display='inline';
    }
  }, 50);
}
window.openMusic = openMusic;
