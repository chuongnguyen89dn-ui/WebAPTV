(()=>{'use strict';
// Static-Pages compatibility layer for VELORA endpoints that originally lived in PHP.
// TV intentionally starts empty; a playlist/source can be attached later without breaking Split View.
const nativeFetch=window.fetch.bind(window);
const json=(body,status=200)=>Promise.resolve(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8'}}));
async function mapApi(u,init){
  const action=u.searchParams.get('action')||'config';
  if(action==='config') return json({ok:true,provider:'osm',attribution:'© OpenStreetMap contributors',tiles:'https://tile.openstreetmap.org/{z}/{x}/{y}.png'});
  if(action==='search'){
    const q=(u.searchParams.get('q')||'').trim();
    if(q.length<2) return json({ok:true,places:[]});
    try{
      const r=await nativeFetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=vi&q='+encodeURIComponent(q),{...init,headers:{...(init&&init.headers||{}),'Accept':'application/json'}});
      if(!r.ok) throw Error('search failed');
      const rows=await r.json();
      return json({ok:true,places:rows.map(x=>({name:x.display_name||q,lat:Number(x.lat),lon:Number(x.lon)})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon))});
    }catch(_){return json({ok:true,places:[]});}
  }
  // Camera data is optional on the static build; keep the map/GPS usable when no backend is present.
  if(action==='cameras'){
    const lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon'));
    return json({ok:true,cameras:[],center:[Number.isFinite(lon)?lon:0,Number.isFinite(lat)?lat:0],retrieved:Math.floor(Date.now()/1000),truncated:false});
  }
  return json({ok:false,error:'Unsupported map action'},400);
}
window.fetch=(input,init)=>{
  const raw=typeof input==='string'?input:(input&&input.url)||'';
  let u; try{u=new URL(raw,location.href);}catch(_){return nativeFetch(input,init);}
  if(/\/api\/tv\.php$/.test(u.pathname)) return json({ok:true,channels:[]});
  if(/\/api\/map\.php$/.test(u.pathname)) return mapApi(u,init);
  return nativeFetch(input,init);
};
})();
