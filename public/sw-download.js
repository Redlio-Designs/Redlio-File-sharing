// sw-download.js
//
// Service worker that turns a stream of in-page chunks into a native browser
// download (the StreamSaver pattern). This gives Firefox/Safari — which lack
// the File System Access API — a path where received bytes go straight to
// disk through the browser's download manager instead of piling up in RAM.
//
// The page creates a MessageChannel per file and posts:
//   {type:'create', id, name, size} + [port]
// The worker registers a ReadableStream for /sw-download/<id>; the page then
// navigates a hidden iframe to that URL, the fetch handler responds with the
// stream, and the browser writes it to disk as a normal download. Chunks
// arrive over the port as {chunk: ArrayBuffer}, completion as {done: true},
// abort as {abort: true}.

const streams = new Map(); // id -> {stream, name, size}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', (e) => {
    const data = e.data;
    if (!data || data.type !== 'create' || !e.ports[0]) return;
    const port = e.ports[0];

    let controller = null;
    const stream = new ReadableStream({
        start(c) { controller = c; },
        cancel() {
            // user cancelled the download in the browser UI
            port.postMessage({ type: 'cancel' });
        }
    });

    port.onmessage = (ev) => {
        const m = ev.data || {};
        if (m.chunk) {
            try { controller.enqueue(new Uint8Array(m.chunk)); } catch { }
        } else if (m.done) {
            try { controller.close(); } catch { }
            port.onmessage = null;
        } else if (m.abort) {
            try { controller.error(new Error('transfer aborted')); } catch { }
            port.onmessage = null;
        }
    };

    streams.set(data.id, { stream, name: data.name || 'file', size: data.size || 0 });
    port.postMessage({ type: 'ready' });
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (!url.pathname.startsWith('/sw-download/')) return;

    const id = url.pathname.split('/').pop();
    const entry = streams.get(id);
    if (!entry) {
        e.respondWith(new Response('download not found', { status: 404 }));
        return;
    }
    streams.delete(id); // one-shot

    const headers = {
        'Content-Type': 'application/octet-stream',
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(entry.name)}`
    };
    if (entry.size > 0) headers['Content-Length'] = String(entry.size);

    e.respondWith(new Response(entry.stream, { headers }));
});
