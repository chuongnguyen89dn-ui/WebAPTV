(()=>{'use strict';
const video=document.getElementById('tvVideo'),screen=document.querySelector('.tv-screen');if(!video||!screen)return;
const bar=document.createElement('div');bar.className='tv-clean-controls';bar.setAttribute('role','group');bar.setAttribute('aria-label','Điều khiển truyền hình');
const play=document.createElement('button'),mute=document.createElement('button');play.type=mute.type='button';
const label=document.createElement('label'),volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value=String(video.volume);label.append(document.createTextNode('Âm lượng'),volume);
const note=document.createElement('small');note.textContent='Phóng to bằng nút phía trên';bar.append(play,mute,label,note);screen.after(bar);
function sync(){bar.hidden=screen.hidden;play.textContent=video.paused?'Phát TV':'Tạm dừng';play.setAttribute('aria-label',play.textContent);mute.textContent=video.muted?'Bật tiếng':'Tắt tiếng';mute.setAttribute('aria-pressed',String(video.muted));volume.value=String(video.volume);}
play.onclick=async()=>{if(!video.paused){video.pause();return;}try{await video.play();}catch(_){const status=document.getElementById('tvStatus');if(status)status.textContent='Chưa phát được. Bấm Thử lại hoặc chọn kênh khác.';}sync();};
mute.onclick=()=>{video.muted=!video.muted;sync();};volume.oninput=()=>{video.volume=Number(volume.value);if(video.volume>0)video.muted=false;sync();};
for(const event of ['play','pause','ended','volumechange','emptied'])video.addEventListener(event,sync);
new MutationObserver(sync).observe(screen,{attributes:true,attributeFilter:['hidden']});
video.controls=false;video.removeAttribute('controls');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('controlslist','nofullscreen nodownload noremoteplayback');video.disablePictureInPicture=true;video.disableRemotePlayback=true;video.classList.add('velora-clean-player');sync();
})();
