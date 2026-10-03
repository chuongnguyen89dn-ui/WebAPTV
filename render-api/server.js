import http from 'node:http';
const PORT=process.env.PORT||10000;
const INSTANCES=['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com','https://invidious.f5.si'];
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function search(q){
  const pipedInstances=[
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.nosebs.ru',
    'https://pipedapi.adminforge.de',
    'https://api.piped.yt',
    'https://pipedapi.drgns.space'
  ];
  for(const base of pipedInstances){
    try{
      let path='/search';
      let nextpage='';
      const all=[];
      for(let page=1;page<=5&&all.length<100;page++){
        const params=new URLSearchParams({q,filter:'videos'});
        if(path.includes('nextpage')) params.set('nextpage',nextpage);
        const r=await fetch(base+path+'?'+params.toString(),{headers:{accept:'application/json','user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(6000)});
        if(!r.ok) break;
        const data=await r.json();
        const rows=Array.isArray(data?.items)?data.items:[];
        for(const x of rows){
          if(x?.type!=='stream') continue;
          const m=String(x.url||'').match(/[?&]v=([A-Za-z0-9_-]{11})/);
          const id=m?.[1]||String(x.videoId||'');
          if(!/^[A-Za-z0-9_-]{11}$/.test(id)) continue;
          all.push({id,title:x.title||'YouTube',channel:x.uploaderName||'YouTube',thumbnail:x.thumbnail||('https://i.ytimg.com/vi/'+id+'/mqdefault.jpg')});
        }
        nextpage=String(data?.nextpage||'');
        if(!nextpage||!rows.length) break;
        path='/nextpage/search';
      }
      const seen=new Set();
      const items=all.filter(x=>!seen.has(x.id)&&(seen.add(x.id),true)).slice(0,100);
      if(items.length)return {ok:true,items,source:base,pages:5};
    }catch{}
  }

  for(const base of INSTANCES){
    try{
      const r=await fetch(base+'/api/v1/search?q='+encodeURIComponent(q)+'&type=video&region=VN',{headers:{accept:'application/json','user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(6000)});
      if(!r.ok)continue;
      const rows=await r.json();
      const items=Array.isArray(rows)?rows.filter(x=>x&&x.type==='video'&&/^[A-Za-z0-9_-]{11}$/.test(x.videoId)).map(x=>({id:x.videoId,title:x.title||'YouTube',channel:x.author||'YouTube',thumbnail:(x.videoThumbnails||[]).find(t=>t.quality==='medium')?.url||'https://i.ytimg.com/vi/'+x.videoId+'/mqdefault.jpg'})):[]; 
      if(items.length)return {ok:true,items,source:base};
    }catch{}
  }
  return {ok:false,items:[],error:'No search provider available'};
}
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/health')return json(res,200,{ok:true});if(u.pathname==='/api/search'){const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{ok:false,error:'Missing q'});const out=await search(q);return json(res,out.ok?200:502,out);}return json(res,404,{ok:false,error:'Not found'});}catch(e){return json(res,500,{ok:false,error:e?.message||'Server error'});}}).listen(PORT,()=>console.log('search api on',PORT));
