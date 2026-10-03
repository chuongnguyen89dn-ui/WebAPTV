(()=>{'use strict';
// Static-Pages compatibility layer for VELORA endpoints that originally lived in PHP.
// TV intentionally starts empty; a playlist/source can be attached later without breaking Split View.
const nativeFetch=window.fetch.bind(window);
const json=(body,status=200)=>Promise.resolve(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8'}}));
window.fetch=(input,init)=>{
  const raw=typeof input==='string'?input:(input&&input.url)||'';
  let u; try{u=new URL(raw,location.href);}catch(_){return nativeFetch(input,init);}
  if(/\/api\/tv\.php$/.test(u.pathname)) return json({ok:true,channels:[]});
  return nativeFetch(input,init);
};
})();
