(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const cfg = window.CARTUBE_CONFIG || {};
  const state = {currentVideo:null, results:[]};
  const FITS = [.80,.90,1];

  const els = {
    form: $('#searchForm'), search: $('#searchInput'), url: $('#urlInput'), playUrl: $('#playUrlBtn'),
    results: $('#results'), status: $('#statusBar'), fit: $('#fitBtn'), modal: $('#playerModal'),
    stage: $('#playerStage'), hint: $('#playerHint'), manualPlay: $('#manualPlayBtn'), retry: $('#retryPlayerBtn'), playerFit: $('#playerFitBtn'), title: $('#playerTitle'), channel: $('#playerChannel'), close: $('#closePlayerBtn'),
    openYoutube: $('#openYoutubeBtn'), home: $('#homeBtn'), hero: $('#hero'), history: $('#historyBtn')
  };

  const playback = new window.CarTubePlayer(els.stage, els.hint, els.manualPlay);
  let lastFocus;

  function status(msg, type='') {
    els.status.hidden = !msg;
    els.status.textContent = msg || '';
    els.status.className = `status-bar ${type}`.trim();
  }

  function parseYouTubeId(input) {
    if (typeof input !== 'string') return null;
    const raw = input.trim();
    const valid = id => /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    if (valid(raw)) return raw;
    try {
      const u = new URL(raw.includes('://') ? raw : 'https://' + raw);
      if (!['https:', 'http:'].includes(u.protocol)) return null;
      const host = u.hostname.toLowerCase();
      const parts = u.pathname.split('/').filter(Boolean);
      if (host === 'youtu.be' || host === 'www.youtu.be') return valid(parts[0]);
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
        if (u.pathname === '/watch') return valid(u.searchParams.get('v'));
        if (['shorts', 'live', 'embed'].includes(parts[0])) return valid(parts[1]);
      }
    } catch (_) {}
    return null;
  }

  function videoUrl(id){ return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`; }

  function saveHistory(item){
    try {
      const list = getHistory();
      const next = [item, ...list.filter(x => x.id !== item.id)].slice(0, 30);
      localStorage.setItem('cartubeHistory', JSON.stringify(next));
    } catch (_) {}
  }

  function getHistory(){
    try { const list = JSON.parse(localStorage.getItem('cartubeHistory') || '[]'); return Array.isArray(list) ? list.filter(x => x && /^[A-Za-z0-9_-]{11}$/.test(x.id)).slice(0,30) : []; }
    catch (_) { return []; }
  }

  async function fetchMeta(id){
    try {
      const r = await fetch(`api/meta.php?id=${encodeURIComponent(id)}`, {cache:'no-store'});
      if (!r.ok) throw new Error('meta');
      const data = await r.json();
      if (!data || typeof data !== 'object') throw new Error('meta');
      return data;
    } catch (_) {
      return {id, title:'YouTube video', channel:'YouTube', thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`};
    }
  }

  async function playFromInput(raw){
    const id = parseYouTubeId(raw);
    if (!id) { status('Liên kết YouTube không hợp lệ.', 'error'); return; }
    // Open immediately; metadata must never delay playback or reopen a closed modal.
    playVideo({id, title:'YouTube video', channel:'YouTube'});
    const openedItem = state.currentVideo;
    const item = await fetchMeta(id);
    if (state.currentVideo !== openedItem || els.modal.hidden) return;
    els.title.textContent = item.title || 'YouTube';
    els.channel.textContent = item.channel || '';
    Object.assign(openedItem, {title:item.title, channel:item.channel, thumbnail:item.thumbnail});
    saveHistory(openedItem);
  }

  function playVideo(item){
    if (!item || !/^[A-Za-z0-9_-]{11}$/.test(item.id)) return;
    status('');
    if (els.modal.hidden) lastFocus = document.activeElement;
    state.currentVideo = {...item};
    els.title.textContent = item.title || 'YouTube';
    els.channel.textContent = item.channel || '';
    els.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    els.close.focus();
    playback.open(item.id);
    saveHistory({id:item.id,title:item.title||'YouTube',channel:item.channel||'YouTube',thumbnail:item.thumbnail||`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,live:!!item.live});
  }

  function closePlayer(){
    playback.close();
    state.currentVideo = null;
    els.modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  }

  function card(item){
    const node = $('#cardTemplate').content.firstElementChild.cloneNode(true);
    const img = $('.thumb', node), title = $('.title', node), channel = $('.channel', node), live = $('.live-badge', node), dur = $('.duration', node), btn = $('.thumb-btn', node);
    img.src = item.thumbnail || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
    img.alt = item.title || 'YouTube video';
    title.textContent = item.title || 'YouTube video';
    channel.textContent = item.channel || 'YouTube';
    live.hidden = !item.live;
    dur.textContent = item.duration || '';
    dur.hidden = !item.duration || item.live;
    btn.addEventListener('click', () => playVideo(item));
    return node;
  }

  function render(items, emptyText='Không có video.'){
    state.results = items || [];
    els.results.innerHTML = '';
    if (!state.results.length) {
      const e = document.createElement('div'); e.className='empty'; e.textContent=emptyText; els.results.appendChild(e); return;
    }
    const f = document.createDocumentFragment(); state.results.forEach(x => f.appendChild(card(x))); els.results.appendChild(f);
  }

  async function search(q){
    q = (q || '').trim();
    if (!q) return;
    const directId = parseYouTubeId(q);
    if (directId) return playFromInput(q);
    if (!cfg.hasApiKey) {
      status('Tìm kiếm trong app chưa bật. Thêm YouTube Data API key vào config.php; bạn vẫn có thể dán link để mở video cho phép nhúng.', 'error');
      render([], 'Hãy dán link YouTube vào ô phía trên để phát ngay.');
      return;
    }
    status(`Đang tìm “${q}”…`);
    render([], 'Đang tải…');
    try {
      const r = await fetch(`api/search.php?q=${encodeURIComponent(q)}`, {cache:'no-store'});
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || 'Search failed');
      status(`${data.items.length} kết quả cho “${q}”`, 'success');
      render(data.items, 'Không tìm thấy video phù hợp.');
    } catch (e) {
      status(e.message || 'Không thể tìm kiếm YouTube.', 'error');
      render([], 'Tìm kiếm thất bại.');
    }
  }

  function applyFit(v){
    v = FITS.includes(v) ? v : .90;
    document.documentElement.style.setProperty('--ui-scale', String(v));
    els.fit.textContent = `Fit ${Math.round(v*100)}%`;
    els.playerFit.textContent = els.fit.textContent;
    try { localStorage.setItem('cartubeFit', String(v)); } catch (_) {}
  }

  function cycleFit(){
    const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale')) || .9;
    const idx = FITS.findIndex(x => Math.abs(x-current)<.01);
    applyFit(FITS[(idx+1)%FITS.length]);
  }

  function goHome(){
    status('');
    els.hero.hidden = false;
    render(getHistory().slice(0,8), getHistory().length ? '' : 'Dán một link YouTube để bắt đầu. Video đã xem gần đây sẽ hiện ở đây.');
    $$('.nav-item').forEach(x=>x.classList.remove('active'));
    $('.nav-item[data-view="home"]')?.classList.add('active');
  }

  els.form.addEventListener('submit', e => {e.preventDefault(); els.hero.hidden=true; search(els.search.value);});
  els.playUrl.addEventListener('click', () => playFromInput(els.url.value));
  els.url.addEventListener('keydown', e => {if(e.key==='Enter'){e.preventDefault();playFromInput(els.url.value);}});
  els.close.addEventListener('click', closePlayer);
  els.modal.addEventListener('click', e => {if(e.target===els.modal) closePlayer();});
  els.openYoutube.addEventListener('click', () => {if(state.currentVideo) location.href = videoUrl(state.currentVideo.id);});
  els.fit.addEventListener('click', cycleFit);
  els.playerFit.addEventListener('click', cycleFit);
  els.retry.addEventListener('click', () => { if(state.currentVideo) playback.open(state.currentVideo.id); });
  els.home.addEventListener('click', goHome);
  els.history.addEventListener('click', () => {els.hero.hidden=true; status('Video đã xem gần đây'); render(getHistory(), 'Chưa có lịch sử xem.');});
  $$('.nav-item[data-query]').forEach(b => b.addEventListener('click', () => {els.hero.hidden=true; els.search.value=b.dataset.query; search(b.dataset.query);}));
  $('.nav-item[data-view="home"]')?.addEventListener('click', goHome);
  document.addEventListener('keydown', e => {if(e.key==='Escape' && !els.modal.hidden) closePlayer();});

  let savedFit = .90;
  try { savedFit = parseFloat(localStorage.getItem('cartubeFit')); } catch (_) {}
  applyFit(savedFit);
  goHome();
})();
