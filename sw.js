const CACHE='journal-shell-a3017bd7e2fa';
const ASSETS=["./","./index.html","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./assets/index-CpAtS6qq.js","./assets/web-CeRFjiH0.js","./assets/web-CyaJ0raw.js","./assets/web-O3KNRucd.js","./assets/web-caBWbRdY.js","./assets/index-dcBT83-g.css"];
const URLS=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('journal-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match(new URL('./index.html',self.registration.scope)).then(r=>r||Response.error())));return;}
 if(!URLS.has(url.href))return;
 // Only build-listed public assets reach this branch. Module/CSS requests can
 // carry Origin while precache requests do not (preview servers use Vary: Origin).
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(req,{ignoreVary:true})).then(hit=>hit||fetch(req)));
});