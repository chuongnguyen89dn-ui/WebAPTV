(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
const json=(body,status=200)=>Promise.resolve(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8'}}));
async function mapApi(u,init){const a=u.searchParams.get('action')||'config';
if(a==='config')return json({ok:true,provider:'osm',attribution:'© OpenStreetMap contributors',tiles:'https://tile.openstreetmap.org/{z}/{x}/{y}.png'});
if(a==='search'){const q=(u.searchParams.get('q')||'').trim();if(q.length<2)return json({ok:true,places:[]});try{const r=await nativeFetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=vi&q='+encodeURIComponent(q),{...init,headers:{...(init?.headers||{}),Accept:'application/json'}});const rows=r.ok?await r.json():[];return json({ok:true,places:rows.map(x=>({name:x.display_name||q,lat:Number(x.lat),lon:Number(x.lon)})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon))});}catch(_){return json({ok:true,places:[]});}}
if(a==='cameras')return json({ok:true,cameras:[]});return json({ok:false,error:'Unsupported map action'},400);}
window.fetch=async(input,init)=>{const raw=typeof input==='string'?input:(input&&input.url)||'';let u;try{u=new URL(raw,location.href)}catch(_){return nativeFetch(input,init)}
if(/\/api\/tv\.php$/.test(u.pathname))return json({ok:true,channels:[]});
if(/\/api\/map\.php$/.test(u.pathname))return mapApi(u,init);
if(/\/api\/(meta|search)\.php$/.test(u.pathname)){
 if(u.pathname.endsWith('/meta.php')){const id=u.searchParams.get('id')||'';return json({ok:true,id,title:'YouTube video',channel:'YouTube',thumbnail:'https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/hqdefault.jpg'});}
 const q=u.searchParams.get('q')||'';
 try{const r=await nativeFetch('https://webaptv-search-api.onrender.com/api/search?q='+encodeURIComponent(q),{cache:'no-store'});if(r.ok){const data=await r.json();if(data?.ok&&Array.isArray(data.items)&&data.items.length)return json(data);}}catch(_){}
 const url='https://www.youtube.com/results?search_query='+encodeURIComponent(q);return json({ok:true,items:[{id:'yt-search',title:'Tìm “'+q+'” trên YouTube',url,web_url:url,external:true}],stale:true,warning:'Không lấy được kết quả trực tiếp; mở kết quả YouTube.'});
}
return nativeFetch(input,init);};
})();