(()=>{'use strict';
const card=document.querySelector('.speed-card'),dial=card?.querySelector('.speed-dial'),metrics=card?.querySelector('.metrics');if(!card||!dial)return;
// Original artwork: 1086 × 1448; neon ring centre (543,584).
// 800 image pixels span the dial square, placing its bezel inside the neon rim.
const artwork=document.createElement('div');artwork.className='gps-art-layer';artwork.setAttribute('aria-hidden','true');card.prepend(artwork);
let scheduled=false;
function align(){scheduled=false;if(card.dataset.gps!=='ring'){card.classList.remove('gps-aligned');return;}
 const box=card.getBoundingClientRect(),face=dial.getBoundingClientRect();if(!box.width||!face.width||!face.height)return;
 const cssScale=card.offsetWidth/box.width,width=face.width*cssScale,scale=width/800;
 const cx=(face.left-box.left)*cssScale-card.clientLeft+width/2;
 const cy=(face.top-box.top)*cssScale-card.clientTop+face.height*cssScale/2;
 const values={'--gps-art-cx':cx,'--gps-art-cy':cy,'--gps-art-width':1086*scale,'--gps-art-height':1448*scale,'--gps-art-x':cx-543*scale,'--gps-art-y':cy-584*scale};
 for(const[key,value]of Object.entries(values))card.style.setProperty(key,value.toFixed(3)+'px');
 card.classList.add('gps-aligned');
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(align);}}
if(window.ResizeObserver){const observer=new ResizeObserver(schedule);[card,dial,metrics].filter(Boolean).forEach(el=>observer.observe(el));}
new MutationObserver(schedule).observe(card,{attributes:true,attributeFilter:['data-gps']});
addEventListener('resize',schedule);addEventListener('orientationchange',schedule);addEventListener('pageshow',schedule);
document.fonts?.ready.then(schedule);schedule();
})();
