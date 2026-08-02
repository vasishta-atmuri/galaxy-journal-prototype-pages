const CACHE_NAME = "galaxy-journal-shell-v2";

function fromScope(path) {
  return new URL(path, self.registration.scope).toString();
}

const SHELL_ASSETS = [
  fromScope("./"),
  fromScope("manifest.webmanifest"),
  fromScope("favicon.svg"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (!event.request.url.startsWith(self.registration.scope)) {
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
