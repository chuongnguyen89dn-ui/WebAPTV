import http from 'node:http';
const PORT=process.env.PORT||10000;
const INSTANCES=['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com','https://invidious.f5.si'];
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function search(q,pageToken=''){
  const key=process.env.YOUTUBE_API_KEY;
  if(!key)return {ok:false,items:[],error:'YOUTUBE_API_KEY is not configured'};
  const p=new URLSearchParams({part:'snippet',q,type:'video',maxResults:'50',regionCode:'VN',relevanceLanguage:'vi',key});
  if(pageToken)p.set('pageToken',pageToken);
  const r=await fetch('https://www.googleapis.com/youtube/v3/search?'+p.toString(),{headers:{accept:'application/json'},signal:AbortSignal.timeout(10000)});
  const data=await r.json();
  if(!r.ok)return {ok:false,items:[],error:data?.error?.message||'YouTube API error',code:data?.error?.code};
  const items=(Array.isArray(data.items)?data.items:[]).filter(x=>x?.id?.videoId).map(x=>({
    id:x.id.videoId,
    title:x.snippet?.title||'YouTube',
    channel:x.snippet?.channelTitle||'YouTube',
    thumbnail:x.snippet?.thumbnails?.high?.url||x.snippet?.thumbnails?.medium?.url||x.snippet?.thumbnails?.default?.url||'',
    publishedAt:x.snippet?.publishedAt||''
  }));
  return {ok:true,items,nextPageToken:data.nextPageToken||'',hasMore:!!data.nextPageToken,source:'youtube-data-api'};
}
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/health')return json(res,200,{ok:true});if(u.pathname==='/api/search'){const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{ok:false,error:'Missing q'});const out=await search(q);return json(res,out.ok?200:502,out);}return json(res,404,{ok:false,error:'Not found'});}catch(e){return json(res,500,{ok:false,error:e?.message||'Server error'});}}).listen(PORT,()=>console.log('search api on',PORT));
