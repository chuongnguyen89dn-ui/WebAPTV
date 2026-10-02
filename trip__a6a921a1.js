/* In-memory GPS estimate. No coordinates are sent or persisted. */
(() => {
  class TripMeter {
    constructor() { this.reset(); }
    reset() { this.meters=0; this.breakSegment(); }
    breakSegment() { this.anchor=null; this.lastTime=null; }
    update(position, now=Date.now()) {
      const c=position.coords, time=position.timestamp;
      const valid=c && Number.isFinite(c.latitude) && Math.abs(c.latitude)<=90 && Number.isFinite(c.longitude) && Math.abs(c.longitude)<=180 && Number.isFinite(c.accuracy) && c.accuracy>=0 && c.accuracy<=35 && Number.isFinite(time) && now-time<=10000 && time-now<=5000;
      if (!valid) { this.breakSegment(); return {speed:null, message:'GPS yếu hoặc dữ liệu đã cũ'}; }
      if (this.lastTime!==null && time<=this.lastTime) return {speed:null,message:'Đang chờ dữ liệu GPS mới'};
      if (this.lastTime!==null && time-this.lastTime>20000) this.breakSegment();
      this.lastTime=time;
      const point={lat:c.latitude,lon:c.longitude,accuracy:c.accuracy,time};
      let rejected=false;
      if (this.anchor) {
        const rad=Math.PI/180;
        const a=Math.sin((point.lat-this.anchor.lat)*rad/2)**2+Math.cos(point.lat*rad)*Math.cos(this.anchor.lat*rad)*Math.sin((point.lon-this.anchor.lon)*rad/2)**2;
        const d=6371000*2*Math.atan2(Math.sqrt(Math.min(1,a)),Math.sqrt(Math.max(0,1-a)));
        const seconds=(time-this.anchor.time)/1000;
        if (seconds<=0 || d/seconds>70) { this.anchor=point; rejected=true; }
        else if(d>=Math.max(5,(this.anchor.accuracy+point.accuracy)/2)) { this.meters+=d; this.anchor=point; }
      } else this.anchor=point;
      const speed=!rejected && typeof c.speed==='number' && Number.isFinite(c.speed) && c.speed>=0 && c.speed<=70 ? c.speed*3.6 : null;
      return {speed,message:rejected?'Đã bỏ điểm GPS nhảy bất thường':speed===null?'GPS không cung cấp tốc độ':`GPS ±${Math.round(c.accuracy)} m · ước lượng`};
    }
  }
  if (typeof module!=='undefined' && module.exports) module.exports=TripMeter;
  else window.TripMeter=TripMeter;
})();
