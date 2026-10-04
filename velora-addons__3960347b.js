(()=>{'use strict';
// Fill the card with the source artwork, then size the live dial to its ring.
const gps=document.querySelector('.speed-card');
if(gps){let pending=false;const fit=()=>{pending=false;const w=gps.clientWidth,h=gps.clientHeight;if(!w||!h)return;const scale=Math.max(w/1086,h/1250),diameter=800*scale,cy=Math.max(diameter/2+20,h*.43);gps.style.setProperty('--addon-fill-dial',diameter+'px');gps.style.setProperty('--addon-fill-y',(cy-diameter/2)+'px');};const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(fit);}};if(window.ResizeObserver)new ResizeObserver(schedule).observe(gps);addEventListener('resize',schedule);fit();}
const clock=document.querySelector('.clock-card'),nav=document.querySelector('.media-nav');
if(clock){const art=document.createElement('div');art.className='addon-weather-art';art.setAttribute('aria-hidden','true');clock.prepend(art);}
if(!nav)return;
const signature=document.createElement('button');signature.type='button';signature.className='velora-signature';signature.hidden=true;signature.setAttribute('aria-label','VELORA Signature · Mở tùy chọn Pro');
signature.innerHTML='<span class="signature-symbol" aria-hidden="true">✦</span><span class="signature-copy"><strong>Hành trình mang dấu ấn riêng</strong><small>VELORA SIGNATURE</small></span><span class="signature-pro">PRO</span>';
nav.querySelector('.media-brand').after(signature);signature.onclick=()=>document.getElementById('optionsBtn').click();
const swap=document.getElementById('swapSideBtn');function label(){if(swap.textContent!=='Đổi bên')swap.textContent='Đổi bên';}new MutationObserver(label).observe(swap,{childList:true});label();

})();

