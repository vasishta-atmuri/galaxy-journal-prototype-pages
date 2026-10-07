const CACHE='journal-shell-fdf37a8036b4';
const ASSETS=["./","./index.html","./icon-32.png","./icon-180.png","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./journal-hero.webp","./manifest.webmanifest","./assets/index-ODCiwSWt.js","./assets/web-Bg_2WqY_.js","./assets/web-CLbE2f9I.js","./assets/web-DilfC3Vm.js","./assets/web-_eE0i92L.js","./assets/index-R8HCOh9r.css"];
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