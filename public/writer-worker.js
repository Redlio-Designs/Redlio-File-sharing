// writer-worker.js
//
// Dedicated worker that owns all disk I/O for the receiver (File System
// Access API). Running writes off the main thread keeps them immune to UI
// jank and tab-throttling, and lets the page thread do nothing but shovel
// chunks from the data channel.
//
// Durability model: FileSystemWritableFileStream writes go to a temporary
// swap file that only lands in the real file on close(). To make transfers
// resumable after a crash or page reload, the worker "checkpoints" every
// CHECKPOINT_BYTES: close() (committing everything written so far), then
// reopen with keepExistingData and seek back to the end. A reload therefore
// loses at most one checkpoint window, and `prepare` can resume from the
// committed size on disk.
//
// Protocol (main -> worker):
//   {op:'init',    dirHandle}                          - directory to write into
//   {op:'prepare', files:[{name,size}]}                - commit any open writers,
//                                                        stat existing files,
//                                                        reply {op:'prepared', offsets}
//   {op:'start',   index, name, size, offset}          - open file, truncate+seek to offset
//   {op:'chunk',   index, buffer}                      - append (buffer is transferred)
//   {op:'finish',  index}                              - close/commit, reply {op:'finished'}
//
// Worker -> main: {op:'prepared', offsets} | {op:'finished', index}
//                 | {op:'error', index, message}

let dirHandle = null;

const CHECKPOINT_BYTES = 64 * 1024 * 1024;

// Per-file state; ops on the same file are serialized through `chain` so
// chunks are never reordered and close/reopen can't race a write.
let files = []; // {name, size, handle, writable, written, lastCheckpoint, chain, failed}

function chainOp(index, fn) {
    const f = files[index];
    if (!f || f.failed) return;
    f.chain = f.chain.then(fn).catch((err) => {
        f.failed = true;
        postMessage({ op: 'error', index, message: String((err && err.message) || err) });
    });
}

async function commitAll() {
    await Promise.all(files.map(async (f) => {
        if (!f) return;
        try {
            await f.chain;
            if (f.writable) {
                await f.writable.close(); // commits buffered data to the real file
                f.writable = null;
            }
        } catch { /* already reported via chainOp */ }
    }));
}

self.onmessage = async (e) => {
    const msg = e.data;

    if (msg.op === 'init') {
        dirHandle = msg.dirHandle;
        return;
    }

    if (msg.op === 'prepare') {
        // A (re)starting transfer: flush whatever is open so the on-disk
        // sizes are accurate, then report them as resume offsets.
        await commitAll();
        files = [];
        const offsets = [];
        for (const spec of msg.files) {
            let offset = 0;
            try {
                const fh = await dirHandle.getFileHandle(spec.name);
                const existing = await fh.getFile();
                // Resume only if the partial file is plausibly ours; a file
                // larger than the incoming one is something else -> restart.
                if (existing.size > 0 && existing.size <= spec.size) {
                    offset = existing.size;
                }
            } catch { /* no existing file -> start at 0 */ }
            files.push({
                name: spec.name, size: spec.size,
                handle: null, writable: null,
                written: offset, lastCheckpoint: offset,
                chain: Promise.resolve(), failed: false
            });
            offsets.push(offset);
        }
        postMessage({ op: 'prepared', offsets });
        return;
    }

    if (msg.op === 'start') {
        chainOp(msg.index, async () => {
            const f = files[msg.index];
            if (f.writable) { try { await f.writable.close(); } catch { } }
            f.handle = await dirHandle.getFileHandle(f.name, { create: true });
            f.writable = await f.handle.createWritable({ keepExistingData: msg.offset > 0 });
            // Drop any stale tail beyond the resume point, then append from it.
            await f.writable.truncate(msg.offset);
            await f.writable.seek(msg.offset);
            f.written = msg.offset;
            f.lastCheckpoint = msg.offset;
        });
        return;
    }

    if (msg.op === 'chunk') {
        const chunk = new Uint8Array(msg.buffer);
        chainOp(msg.index, async () => {
            const f = files[msg.index];
            await f.writable.write(chunk);
            f.written += chunk.byteLength;
            if (f.written - f.lastCheckpoint >= CHECKPOINT_BYTES) {
                await f.writable.close();
                f.writable = await f.handle.createWritable({ keepExistingData: true });
                await f.writable.seek(f.written);
                f.lastCheckpoint = f.written;
            }
        });
        return;
    }

    if (msg.op === 'finish') {
        chainOp(msg.index, async () => {
            const f = files[msg.index];
            if (f.writable) {
                await f.writable.close();
                f.writable = null;
            }
            postMessage({ op: 'finished', index: msg.index });
        });
        return;
    }
};
