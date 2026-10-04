(()=>{'use strict';
const dialog=document.querySelector('.pro-personalize');if(!dialog)return;
const viewport=window.visualViewport;let baseline=viewport?.height||innerHeight,frame=0;
function update(){frame=0;if(dialog.hidden){dialog.classList.remove('led-keyboard');baseline=viewport?.height||innerHeight;return;}
 const field=document.activeElement,editing=dialog.contains(field)&&field?.matches('input[type=text]');
 const height=viewport?.height||innerHeight;
 // Do not counteract deliberate pinch zoom or disable browser zoom accessibility.
 if(viewport&&Math.abs(viewport.scale-1)>.05){dialog.classList.remove('led-keyboard');return;}
 if(!editing)baseline=Math.max(baseline,height);
 const keyboard=editing&&(height<baseline-100||height<360);
 dialog.classList.toggle('led-keyboard',keyboard);
 if(keyboard){dialog.style.setProperty('--led-view-height',height+'px');dialog.style.setProperty('--led-view-width',(viewport?.width||innerWidth)+'px');dialog.style.setProperty('--led-view-top',(viewport?.offsetTop||0)+'px');dialog.style.setProperty('--led-view-left',(viewport?.offsetLeft||0)+'px');}
}
function schedule(){if(!frame)frame=requestAnimationFrame(update);}
dialog.addEventListener('focusin',schedule);dialog.addEventListener('focusout',schedule);
new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['hidden']});
viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);addEventListener('resize',schedule);
addEventListener('orientationchange',()=>{baseline=viewport?.height||innerHeight;schedule();});
})();
