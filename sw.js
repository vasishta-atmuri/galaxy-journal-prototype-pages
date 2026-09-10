const CACHE='journal-shell-1448ba93e5fd';
const ASSETS=["./","./index.html","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./assets/index-B-ZL7q8n.js","./assets/web-BaoQt71f.js","./assets/web-CevL96LH.js","./assets/web-eduIIP3F.js","./assets/index-C-Eb9wtH.css"];
const URLS=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('journal-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match(new URL('./index.html',self.registration.scope)).then(r=>r||Response.error())));return;}
 if(!URLS.has(url.href))return;
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});