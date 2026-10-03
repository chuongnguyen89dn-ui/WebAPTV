import http from 'node:http';
const PORT=process.env.PORT||10000;
const INSTANCES=['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com','https://invidious.f5.si'];
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function search(q){
  const seen=new Set();
  const items=[];
  const add=(x)=>{
    const id=String(x?.videoId||x?.id||'');
    if(!/^[A-Za-z0-9_-]{11}$/.test(id)||seen.has(id))return;
    seen.add(id);
    items.push({id,title:x.title||'YouTube',channel:x.author||x.uploaderName||'YouTube',thumbnail:x.thumbnail||((x.videoThumbnails||[]).find(t=>t.quality==='medium')?.url)||('https://i.ytimg.com/vi/'+id+'/mqdefault.jpg')});
  };

  // Invidious search explicitly supports page=N; collect several pages instead
  // of assuming one response is the complete result set.
  for(const base of INSTANCES){
    try{
      items.length=0;seen.clear();
      for(let page=1;page<=6;page++){
        const url=base+'/api/v1/search?q='+encodeURIComponent(q)+'&type=video&region=VN&page='+page;
        const r=await fetch(url,{headers:{accept:'application/json','user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(6000)});
        if(!r.ok)break;
        const rows=await r.json();
        if(!Array.isArray(rows)||!rows.length)break;
        for(const x of rows)if(x?.type==='video')add(x);
        if(rows.length<10)break;
      }
      if(items.length>0)return {ok:true,items:items.slice(0,100),source:base,pages:6};
    }catch{}
  }

  // Piped fallback, using its opaque nextpage token correctly.
  for(const base of ['https://pipedapi.kavin.rocks','https://pipedapi.leptons.xyz','https://pipedapi.nosebs.ru','https://pipedapi.adminforge.de','https://api.piped.yt']){
    try{
      items.length=0;seen.clear();
      const first=await fetch(base+'/search?q='+encodeURIComponent(q)+'&filter=videos',{headers:{accept:'application/json'},signal:AbortSignal.timeout(6000)});
      if(!first.ok)continue;
      let data=await first.json();
      for(const x of (Array.isArray(data?.items)?data.items:[])){
        const m=String(x?.url||'').match(/[?&]v=([A-Za-z0-9_-]{11})/); add({...x,videoId:m?.[1]||x?.videoId,thumbnail:x?.thumbnail});
      }
      for(let page=1;page<6 && data?.nextpage;page++){
        const np=encodeURIComponent(String(data.nextpage));
        const r=await fetch(base+'/nextpage/search?nextpage='+np+'&q='+encodeURIComponent(q)+'&filter=videos',{headers:{accept:'application/json'},signal:AbortSignal.timeout(6000)});
        if(!r.ok)break;
        data=await r.json();
        for(const x of (Array.isArray(data?.items)?data.items:[])){
          const m=String(x?.url||'').match(/[?&]v=([A-Za-z0-9_-]{11})/); add({...x,videoId:m?.[1]||x?.videoId,thumbnail:x?.thumbnail});
        }
      }
      if(items.length>0)return {ok:true,items:items.slice(0,100),source:base};
    }catch{}
  }
  return {ok:false,items:[],error:'No search provider available'};
}
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/health')return json(res,200,{ok:true});if(u.pathname==='/api/search'){const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{ok:false,error:'Missing q'});const out=await search(q);return json(res,out.ok?200:502,out);}return json(res,404,{ok:false,error:'Not found'});}catch(e){return json(res,500,{ok:false,error:e?.message||'Server error'});}}).listen(PORT,()=>console.log('search api on',PORT));
