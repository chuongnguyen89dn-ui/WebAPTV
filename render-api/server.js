import http from 'node:http';
const PORT=process.env.PORT||10000;
const INSTANCES=['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com','https://invidious.f5.si'];
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function search(q){for(const base of INSTANCES){try{
  const all=[];
  for(let page=1;page<=3&&all.length<60;page++){
    const r=await fetch(base+'/api/v1/search?q='+encodeURIComponent(q)+'&type=video&region=VN&page='+page,{headers:{accept:'application/json','user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(5000)});
    if(!r.ok)break;
    const rows=await r.json();
    if(!Array.isArray(rows)||!rows.length)break;
    for(const x of rows){
      if(x&&x.type==='video'&&/^[A-Za-z0-9_-]{11}$/.test(x.videoId)){
        all.push({id:x.videoId,title:x.title||'YouTube',channel:x.author||'YouTube',thumbnail:(x.videoThumbnails||[]).find(t=>t.quality==='medium')?.url||'https://i.ytimg.com/vi/'+x.videoId+'/mqdefault.jpg'});
      }
    }
    if(rows.length<10)break;
  }
  const seen=new Set(),items=all.filter(x=>!seen.has(x.id)&&(seen.add(x.id),true)).slice(0,60);
  if(items.length)return {ok:true,items,source:base};
}catch{}}return {ok:false,items:[],error:'No search provider available'};}
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/health')return json(res,200,{ok:true});if(u.pathname==='/api/search'){const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{ok:false,error:'Missing q'});const out=await search(q);return json(res,out.ok?200:502,out);}return json(res,404,{ok:false,error:'Not found'});}catch(e){return json(res,500,{ok:false,error:e?.message||'Server error'});}}).listen(PORT,()=>console.log('search api on',PORT));
