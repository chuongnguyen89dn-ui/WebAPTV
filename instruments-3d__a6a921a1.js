(()=>{'use strict';
const dial=document.querySelector('.speed-dial'),value=document.getElementById('speedValue');
if(!dial||!value)return;
const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
svg.setAttribute('viewBox','0 0 240 240');svg.setAttribute('aria-hidden','true');svg.classList.add('gauge-scale');
function node(name,attrs){const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(name==='path'&&!attrs.class)n.classList.add('dial-layer');svg.append(n);return n;}
function point(angle,r){const a=angle*Math.PI/180;return[120+Math.cos(a)*r,120+Math.sin(a)*r];}
function arc(r){const a=point(135,r),b=point(405,r);return`M ${a} A ${r} ${r} 0 1 1 ${b}`;}
const defs=document.createElementNS(NS,'defs');defs.innerHTML='<linearGradient id="rimMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2fcff"/><stop offset=".17" stop-color="#3186b3"/><stop offset=".4" stop-color="#061830"/><stop offset=".66" stop-color="#235481"/><stop offset=".85" stop-color="#7ccde8"/><stop offset="1" stop-color="#06101d"/></linearGradient><linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7ffff"/><stop offset=".3" stop-color="#36d6ff"/><stop offset=".58" stop-color="#0578c3"/><stop offset="1" stop-color="#051831"/></linearGradient><radialGradient id="dialGlass" cx=".34" cy=".15" r=".85"><stop stop-color="#286097"/><stop offset=".45" stop-color="#08214d"/><stop offset="1" stop-color="#010c20"/></radialGradient>';svg.append(defs);
node('path',{d:arc(100)+' L120 120 Z',fill:'url(#dialGlass)',stroke:'none'});
node('path',{d:arc(109),fill:'none',stroke:'#010614','stroke-width':19});
node('path',{d:arc(109),fill:'none',stroke:'url(#rimMetal)','stroke-width':13});
node('path',{d:arc(108),fill:'none',stroke:'#087cae','stroke-width':6});
node('path',{d:arc(103),fill:'none',stroke:'#76eaff','stroke-width':1});
const active=node('path',{d:arc(108),fill:'none',stroke:'#60f0ff','stroke-width':7,'stroke-linecap':'round',pathLength:100,'stroke-dasharray':'0 100',class:'gauge-active'});
for(let i=0;i<=44;i++){const major=i%4===0,a=135+i/44*270,start=point(a,major?90:96),end=point(a,102);node('line',{x1:start[0],y1:start[1],x2:end[0],y2:end[1],stroke:major?'#b5efff':'#5b9bc5','stroke-width':major?2:1});if(major){const pos=point(a,79),t=node('text',{x:pos[0],y:pos[1]+3,'text-anchor':'middle',fill:'#d1efff','font-size':9});t.textContent=String(i*5);}}
const needle=node('path',{d:'M 120 21 L 116 32 L 124 32 Z',fill:'#fff',class:'gauge-needle'});
dial.prepend(svg);
function render(){const raw=value.textContent.trim(),speed=raw!==''&&/^\d+(\.\d+)?$/.test(raw)?Number(raw):NaN,valid=Number.isFinite(speed);dial.classList.toggle('no-signal',!valid);const portion=valid?Math.min(220,Math.max(0,speed))/220:0;active.setAttribute('stroke-dasharray',`${portion*100} 100`);needle.setAttribute('transform',`rotate(${225+portion*270} 120 120)`);needle.style.display=valid?'':'none';}
new MutationObserver(render).observe(value,{childList:true,subtree:true,characterData:true});render();
const content=document.querySelector('.clock-content'),icon=document.createElement('div');icon.className='weather-orb';icon.setAttribute('aria-hidden','true');icon.innerHTML='<span class="orb-sun"></span><span class="orb-cloud"></span><span class="orb-rain">╱ ╱ ╱</span><span class="orb-unknown">◇</span>';content.prepend(icon);
const clock=document.querySelector('.clock-card');clock.dataset.weather='unknown';
let expiry;
addEventListener('velora-weather',e=>{clearTimeout(expiry);const w=e.detail,c=w?.code;clock.dataset.weather=Number.isFinite(c)?c===0?'clear':c<=3?'cloud':c<=48?'fog':c>=71&&c<=77||c>=85&&c<=86?'snow':'rain':'unknown';if(w)expiry=setTimeout(()=>{clock.dataset.weather='unknown';},900000);});
})();
