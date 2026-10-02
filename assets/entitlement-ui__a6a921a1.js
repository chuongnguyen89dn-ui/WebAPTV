(()=>{'use strict';function apply(u){for(const link of document.querySelectorAll('a[href="pair.php"]')){link.classList.toggle('pro-hide-activation',!!u?.pro);}document.body.classList.toggle('device-is-pro',!!u?.pro);}
addEventListener('velora-account',e=>apply(e.detail?.user));
if(!document.getElementById('optionsSheet')){async function check(){try{const r=await fetch('api/account.php',{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error();apply((await r.json()).user);}catch(_){apply(null);}}check();setInterval(()=>{if(!document.hidden)check();},60000);}
})();
