// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// WebRTC ICE configuration, served dynamically so TURN credentials come from
// the environment instead of being hardcoded in the client.
//
// STUN alone handles most home/simple-NAT setups. TURN is REQUIRED when a peer
// is behind symmetric NAT or a strict corporate firewall — without a reachable
// relay the connection silently fails and the transfer never starts.
//
// Configure your own relay (recommended: Cloudflare TURN — free 1 TB/month —
// or self-hosted coturn) with:
//   TURN_URLS="turn:your.relay:3478,turns:your.relay:5349?transport=tcp"
//   TURN_USERNAME="..."
//   TURN_CREDENTIAL="..."
// Without these env vars the app falls back to the public Open Relay servers,
// which are shared, rate-limited and often unreliable — fine for demos only.
app.get('/rtc-config.js', (_req, res) => {
    const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ];
    if (process.env.TURN_URLS) {
        for (const url of process.env.TURN_URLS.split(',')) {
            iceServers.push({
                urls: url.trim(),
                username: process.env.TURN_USERNAME || '',
                credential: process.env.TURN_CREDENTIAL || ''
            });
        }
    } else {
        for (const urls of [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp'
        ]) {
            iceServers.push({ urls, username: 'openrelayproject', credential: 'openrelayproject' });
        }
    }
    res.type('application/javascript').send(
        `window.RTC_CONFIG = ${JSON.stringify({ iceServers, iceCandidatePoolSize: 4 }, null, 2)};\n`
    );
});

app.use(express.static('public'));

// pretty routes
app.get('/', (_req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'send.html'))
);
app.get('/receive', (_req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'receive.html'))
);

io.on('connection', (socket) => {
    // join a room per linkId
    socket.on('join', ({ linkId, role }) => {
        socket.join(linkId);
        socket.data = { linkId, role };
        // let the other side know someone is here
        socket.to(linkId).emit('peer-joined', { role });
    });

    // relay SDP/ICE
    socket.on('signal', ({ linkId, payload }) => {
        socket.to(linkId).emit('signal', payload);
    });

    socket.on('disconnect', () => {
        const { linkId, role } = socket.data || {};
        if (linkId) {
            socket.to(linkId).emit('peer-left', { role });
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`P2P demo running on http://localhost:${PORT}`);
});
