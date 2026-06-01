// Shared WebRTC ICE configuration for sender + receiver.
//
// STUN alone handles most home/simple-NAT setups. TURN is REQUIRED when a peer
// is behind symmetric NAT or a strict corporate firewall — without a reachable
// relay the connection silently fails and the transfer never starts. The free
// Open Relay TURN servers below let the app work in those cases out of the box.
//
// PRODUCTION NOTE: the public Open Relay credentials are shared and rate-limited.
// For a reliable deployment, run your own TURN (e.g. coturn) or use a paid
// provider, then replace the turn: entries below.
window.RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    iceCandidatePoolSize: 4
};
