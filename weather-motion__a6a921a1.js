(()=>{'use strict';const clock=document.querySelector('.clock-card');if(!clock)return;
const layer=document.createElement('div');layer.className='weather-motion';layer.setAttribute('aria-hidden','true');
for(let i=0;i<20;i++){const drop=document.createElement('i');drop.className='weather-particle';drop.style.setProperty('--x',((i*37)%100)+'%');drop.style.setProperty('--delay',(-i*.37)+'s');drop.style.setProperty('--duration',(1.1+(i%5)*.17)+'s');layer.append(drop);}
for(const name of ['weather-cloud-drift','weather-sun-rays','weather-night-glow']){const el=document.createElement('div');el.className=name;layer.append(el);}clock.prepend(layer);
addEventListener('velora-weather',e=>{clock.dataset.night=e.detail?.is_day===0?'yes':'no';});
})();
