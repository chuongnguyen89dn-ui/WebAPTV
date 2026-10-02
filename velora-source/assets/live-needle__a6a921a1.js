(()=>{'use strict';const dial=document.querySelector('.speed-dial'),value=document.getElementById('speedValue'),svg=document.querySelector('.gauge-scale');if(!dial||!value||!svg)return;
const NS='http://www.w3.org/2000/svg';function shape(tag,attrs){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);svg.append(n);return n;}
shape('path',{d:'M45.05 194.95 A106 106 0 1 1 194.95 194.95',fill:'none',class:'live-rim'});
const needle=shape('path',{d:'M120 28 L124 101 L123 134 L117 134 L116 101Z',class:'live-needle'});needle.setAttribute('aria-hidden','true');
const panel=document.createElement('section');panel.className='limit-settings';panel.innerHTML='<h3>Giới hạn theo biển báo</h3><p>Chưa có dữ liệu giới hạn từng đoạn đường. Nhập mức trên biển báo khi xe đã đỗ; đổi lại khi sang đường khác. Tự bỏ sau 15 phút hoặc khi rời trang.</p><label>Giới hạn nhập tay (km/h)<input id="manualLimit" type="number" inputmode="numeric" min="10" max="200" step="1" placeholder="Ví dụ: 60"></label><div><button id="applyLimit" type="button">Áp dụng</button><button id="clearLimit" type="button">Bỏ giới hạn</button></div><p id="limitFeedback" role="status">Chưa biết giới hạn · không đánh giá vượt tốc độ.</p>';
document.querySelector('#optionsSheet section').append(panel);
const badge=document.createElement('button');badge.id='limitBadge';badge.type='button';badge.textContent='Giới hạn: —';badge.setAttribute('aria-label','Cài giới hạn nhập tay');document.querySelector('.trip-value').append(badge);
badge.onclick=()=>{document.getElementById('optionsBtn').click();panel.scrollIntoView({block:'nearest'});document.getElementById('manualLimit').focus();};
let limit=null,expires=0,expiryTimer;const input=document.getElementById('manualLimit'),feedback=document.getElementById('limitFeedback');
function clear(){limit=null;expires=0;clearTimeout(expiryTimer);input.value='';feedback.textContent='Chưa biết giới hạn · không đánh giá vượt tốc độ.';render();}
document.getElementById('clearLimit').onclick=clear;
document.getElementById('applyLimit').onclick=()=>{const n=Number(input.value);if(!input.value.trim()||!Number.isInteger(n)||n<10||n>200){feedback.textContent='Nhập số nguyên từ 10 đến 200 km/h, theo biển báo.';return;}limit=n;expires=Date.now()+15*60*1000;clearTimeout(expiryTimer);expiryTimer=setTimeout(clear,15*60*1000);feedback.textContent=`Đã đặt ${n} km/h · nhập tay, hiệu lực tối đa 15 phút. Không tự nhận diện đường.`;render();};
function mix(a,b,t){return a.map((n,i)=>Math.round(n+(b[i]-n)*t));}
function render(){const text=value.textContent.trim(),speed=/^\d+(\.\d+)?$/.test(text)?Number(text):NaN,valid=Number.isFinite(speed);if(limit!==null&&Date.now()>=expires){limit=null;expires=0;input.value='';feedback.textContent='Giới hạn nhập tay đã hết hạn. Kiểm tra biển báo và nhập lại.';}
 const known=limit!==null,over=valid&&known&&speed>limit,near=valid&&known&&speed>=limit-10;
 let rgb=[91,228,246];if(near&&!over){const t=Math.max(0,Math.min(1,(speed-(limit-10))/10));rgb=t<.5?mix([91,228,246],[255,212,91],t*2):mix([255,212,91],[255,155,62],(t-.5)*2);}if(over)rgb=[255,75,83];
 dial.style.setProperty('--speed-color',`rgb(${rgb.join(',')})`);dial.style.setProperty('--speed-glow',valid?String(.2+.5*Math.min(speed/120,1)):'.1');dial.dataset.speedState=!valid?'unknown':over?'over':near?'near':'normal';
 needle.style.display=valid?'':'none';needle.style.transform=`rotate(${225+Math.min(220,Math.max(0,valid?speed:0))/220*270}deg)`;
 document.body.classList.toggle('speed-warning',over);badge.textContent=known?`${limit} km/h · tay`:'Giới hạn: —';badge.title=known?'Giới hạn bạn nhập, không phải nhận diện tự động.':'Chưa biết giới hạn đường';
 const status=over?'Vượt mức nhập tay':near?'Gần mức nhập tay':known?'Giới hạn nhập tay':'Chưa biết giới hạn';dial.setAttribute('aria-label',valid?`${speed} km/h. ${status}${known?' '+limit+' km/h':''}`:'Chưa có tốc độ GPS');
}
new MutationObserver(render).observe(value,{childList:true,subtree:true,characterData:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});addEventListener('pagehide',clear);render();
})();
