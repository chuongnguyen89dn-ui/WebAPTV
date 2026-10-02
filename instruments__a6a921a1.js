(() => { 'use strict'; const $=id=>document.getElementById(id);
  const fits=[.8,.9,1];let fit=1;try{const v=Number(localStorage.getItem('cartubeFit'));if(fits.includes(v))fit=v;}catch(_){}
  function applyFit(){document.documentElement.style.setProperty('--ui-scale',fit);$('fitBtn').textContent=`Fit ${Math.round(fit*100)}%`;try{localStorage.setItem('cartubeFit',fit);}catch(_){}}
  $('fitBtn').addEventListener('click',()=>{fit=fits[(fits.indexOf(fit)+1)%fits.length];applyFit();});applyFit();
  for(let i=0;i<60;i++){const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1','110');line.setAttribute('x2','110');line.setAttribute('y1','16');line.setAttribute('y2',i%5===0?'23':'19');line.setAttribute('stroke',i%5===0?'#d9e6f0':'#63748a');line.setAttribute('stroke-width',i%5===0?'2':'1');line.setAttribute('transform',`rotate(${i*6} 110 110)`);$('clockTicks').append(line);}
  function clock(){const d=new Date();$('hourHand').setAttribute('transform',`rotate(${(d.getHours()%12)*30+d.getMinutes()/2} 110 110)`);$('minuteHand').setAttribute('transform',`rotate(${d.getMinutes()*6+d.getSeconds()/10} 110 110)`);$('secondHand').setAttribute('transform',`rotate(${d.getSeconds()*6} 110 110)`);$('digitalClock').textContent=d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false});$('digitalClock').dateTime=d.toISOString();$('calendarDate').textContent=d.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});}
  clock();setInterval(clock,1000);
  const trip=new TripMeter();let watch=null,gpsGeneration=0,lastFix=0;
  function showTrip(){$('tripValue').textContent=(trip.meters/1000).toFixed(2);}
  function stopGPS(message){++gpsGeneration;if(watch!==null)navigator.geolocation.clearWatch(watch);watch=null;trip.breakSegment();lastFix=0;$('speedValue').textContent='—';$('gpsDot').classList.remove('active');$('gpsBtn').textContent='Bật GPS';$('gpsStatus').textContent=message||'Đã dừng · giữ quãng đường chuyến';}
  $('gpsBtn').addEventListener('click',()=>{
    if(watch!==null){stopGPS();return;}
    if(!window.isSecureContext||!navigator.geolocation){$('gpsStatus').textContent='Cần HTTPS và trình duyệt hỗ trợ GPS';return;}
    const policy=document.permissionsPolicy||document.featurePolicy;
    if(policy&&policy.allowsFeature&&!policy.allowsFeature('geolocation')){$('gpsStatus').textContent='Header hoặc iframe đang chặn GPS. Bấm ? để kiểm tra.';return;}
    const token=++gpsGeneration;$('gpsStatus').textContent='Đang chờ quyền vị trí / tín hiệu…';$('gpsBtn').textContent='Dừng GPS';
    try{watch=navigator.geolocation.watchPosition(position=>{
      if(token!==gpsGeneration)return;
      const result=trip.update(position);lastFix=Date.now();$('speedValue').textContent=result.speed===null?'—':String(Math.round(result.speed));$('gpsStatus').textContent=result.message;$('gpsDot').classList.toggle('active',result.speed!==null);showTrip();
    },error=>{if(token!==gpsGeneration)return;if(error.code===1)stopGPS('Vị trí bị từ chối. Bấm ⌖ để kiểm tra quyền.');else{$('speedValue').textContent='—';$('gpsDot').classList.remove('active');$('gpsStatus').textContent='Chưa có tín hiệu GPS · đang chờ';trip.breakSegment();}}, {enableHighAccuracy:true,maximumAge:0,timeout:10000});}
    catch(_){stopGPS('Không khởi động được GPS trong trình duyệt này');}
  });
  $('gpsHelpBtn').addEventListener('click',async()=>{
    $('gpsHelp').hidden=false;$('closeGPSHelp').focus();
    const policy=document.permissionsPolicy||document.featurePolicy;
    if(!window.isSecureContext){$('gpsDiagnosis').textContent='Trang chưa ở ngữ cảnh HTTPS an toàn.';return;}
    if(!navigator.geolocation){$('gpsDiagnosis').textContent='Trình duyệt không cung cấp Geolocation API.';return;}
    if(policy&&policy.allowsFeature&&!policy.allowsFeature('geolocation')){$('gpsDiagnosis').textContent='Chính sách của trang/iframe chặn geolocation. Hosting/CDN cần Permissions-Policy: geolocation=(self), không có header geolocation=() trùng.';return;}
    $('gpsDiagnosis').textContent='Trang có HTTPS và API vị trí. Không thể xác định từ website quyền vị trí ở cấp ứng dụng APTV.';
    try{const permission=await navigator.permissions.query({name:'geolocation'});const labels={denied:'Quyền vị trí được báo là từ chối. Có thể do quyền trang, hệ điều hành hoặc ứng dụng; chưa đủ dữ liệu để kết luận WebView chặn.',prompt:'Trình duyệt báo cần xin quyền. Đóng bảng rồi bấm Bật GPS.',granted:'Trình duyệt báo đã cấp quyền. Nếu chưa có số, chờ tín hiệu GPS; thiết bị có thể không cung cấp tốc độ.'};$('gpsDiagnosis').textContent=labels[permission.state]||'Không đọc được trạng thái quyền.';}catch(_){}
  });
  $('closeGPSHelp').addEventListener('click',()=>{$('gpsHelp').hidden=true;$('gpsHelpBtn').focus();});
  $('resetTripBtn').addEventListener('click',()=>{trip.reset();showTrip();$('gpsStatus').textContent='Đã đặt lại quãng đường chuyến';});
  setInterval(()=>{if(watch!==null&&lastFix&&Date.now()-lastFix>10000){$('speedValue').textContent='—';$('gpsDot').classList.remove('active');$('gpsStatus').textContent='Tín hiệu GPS đã cũ · đang chờ';trip.breakSegment();lastFix=0;}},1000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&watch!==null)stopGPS('GPS đã dừng khi rời màn hình');});
  window.addEventListener('pagehide',()=>{stopGPS();});
})();
