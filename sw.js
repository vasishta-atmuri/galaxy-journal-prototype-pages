const CACHE='journal-shell-cb2e08817ceb';
const ASSETS=["./","./index.html","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./assets/index-BuRg_0nY.js","./assets/web-COsSpg4v.js","./assets/web-JHEg5EH5.js","./assets/web-mJnWSAwx.js","./assets/index-BvR5Ocv8.css"];
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