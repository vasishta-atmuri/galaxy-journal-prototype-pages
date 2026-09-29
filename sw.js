const CACHE='journal-shell-a0977dcf5277';
const ASSETS=["./","./index.html","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./assets/index-9-5dd0M9.js","./assets/web-BBfWmX8w.js","./assets/web-BwIS-JWE.js","./assets/web-D7IW3Mxw.js","./assets/web-LMfFb6Gi.js","./assets/index-BO0G_zet.css"];
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