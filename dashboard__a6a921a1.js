(() => {
  'use strict';
  const fits=[.8,.9,1], button=document.querySelector('#fitBtn');
  let current=1;
  try { const saved=Number(localStorage.getItem('cartubeFit')); if(fits.includes(saved)) current=saved; } catch (_) {}
  function apply(){
    document.documentElement.style.setProperty('--ui-scale',String(current));
    button.textContent=`Fit ${Math.round(current*100)}%`;
    button.setAttribute('aria-label',`Kích thước dashboard ${Math.round(current*100)} phần trăm. Bấm để đổi.`);
    try { localStorage.setItem('cartubeFit',String(current)); } catch (_) {}
  }
  button.addEventListener('click',()=>{current=fits[(fits.indexOf(current)+1)%fits.length];apply();});
  function clock(){
    const now=new Date();
    const el=document.querySelector('#clock');
    el.textContent=now.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false});
    el.dateTime=now.toISOString();
    document.querySelector('#dateLabel').textContent=now.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'});
  }
  apply();clock();setInterval(clock,30000);
})();

(() => {
  const themes=['cockpit','glass','minimal'];
  const labels={cockpit:'Cockpit',glass:'Aurora',minimal:'Pure'};
  let theme='cockpit';
  try {const stored=localStorage.getItem('veloraShell');if(themes.includes(stored))theme=stored;} catch (_) {}
  const button=document.querySelector('#themeBtn');
  function apply(){
    document.body.dataset.theme=theme;
    document.querySelector('#themeLabel').textContent=labels[theme];
    button.setAttribute('aria-label',`Giao diện ${labels[theme]}. Bấm để đổi mẫu.`);
    try {localStorage.setItem('veloraShell',theme);} catch (_) {}
  }
  button.addEventListener('click',()=>{theme=themes[(themes.indexOf(theme)+1)%themes.length];apply();});
  apply();
})();
