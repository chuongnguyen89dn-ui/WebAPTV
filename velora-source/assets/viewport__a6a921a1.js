(() => {
  const root=document.documentElement;
  function sync(){
    const v=window.visualViewport;
    root.style.setProperty('--visible-w',`${v?v.width:innerWidth}px`);
    root.style.setProperty('--visible-h',`${v?v.height:innerHeight}px`);
    root.style.setProperty('--visible-x',`${v?v.offsetLeft:0}px`);
    root.style.setProperty('--visible-y',`${v?v.offsetTop:0}px`);
  }
  sync();addEventListener('resize',sync);addEventListener('orientationchange',sync);
  if(window.visualViewport){visualViewport.addEventListener('resize',sync);visualViewport.addEventListener('scroll',sync);}
  const area=document.querySelector('.screen-area'),stage=document.getElementById('playerStage');
  if(area&&stage){
    const fit=()=>{const w=area.clientWidth,h=area.clientHeight;const width=Math.max(0,Math.min(w,h*16/9));stage.style.width=`${width}px`;stage.style.height=`${width*9/16}px`;};
    if(window.ResizeObserver)new ResizeObserver(fit).observe(area);
    addEventListener('resize',fit);fit();
  }
})();
