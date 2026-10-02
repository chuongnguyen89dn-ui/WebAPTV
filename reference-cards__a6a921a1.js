(()=>{'use strict';const clock=document.querySelector('.clock-card');if(!clock)return;
const content=clock.querySelector('.clock-content'),reading=document.createElement('div');reading.className='weather-reading';reading.innerHTML='<strong id="weatherDegrees">—</strong><span id="weatherCondition">Chưa cập nhật</span>';content.append(reading);
const days=document.createElement('div');days.className='forecast-strip';days.hidden=true;days.setAttribute('aria-label','Dự báo bốn ngày');clock.append(days);
const place=document.createElement('span');place.className='weather-place';place.textContent='◈ Thời tiết';clock.querySelector('.clock-head').prepend(place);
function kind(code){return code===0?'☀':code<=3?'☁':code<=48?'≋':code>=95?'⛈':code>=71&&code<=77||code>=85&&code<=86?'❄':'☂';}
function condition(c){return c===0?'Trời quang':c<=3?'Có mây':c<=48?'Sương mù':c>=95?'Dông':c>=71&&c<=77||c>=85&&c<=86?'Tuyết':'Mưa';}
let timer;function reset(){clock.classList.remove('weather-ready');days.replaceChildren();days.hidden=true;reading.querySelector('strong').textContent='—';reading.querySelector('span').textContent='Chưa cập nhật';place.textContent='◈ Thời tiết';}
addEventListener('velora-weather',e=>{clearTimeout(timer);reset();const w=e.detail;if(!w||!Number.isFinite(w.temperature)||!Number.isFinite(w.code))return;clock.classList.add('weather-ready');place.textContent='◈ '+(w.label||'Thời tiết');reading.querySelector('strong').textContent=Math.round(w.temperature)+'°C';reading.querySelector('span').textContent=condition(w.code);
for(const d of (Array.isArray(w.daily)?w.daily:[]).slice(0,4)){if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||![d.code,d.high,d.low].every(Number.isFinite))continue;const card=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('small'),temps=document.createElement('b');icon.textContent=kind(d.code);icon.className='forecast-icon';label.textContent=d.date.slice(8)+'/'+d.date.slice(5,7);temps.textContent=Math.round(d.high)+'°/'+Math.round(d.low)+'°';card.append(icon,label,temps);days.append(card);}days.hidden=!days.childElementCount;timer=setTimeout(reset,900000);});
// Keep the refresh control accessible, but move it into the compact card footer.
document.getElementById('weatherBtn').title='Cập nhật thời tiết';
})();
