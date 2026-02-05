/**
 * FreeVoice Signaling Server
 * WebSocket-based signaling for WebRTC peer connections
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8888;
const MAX_ROOM_SIZE = 50;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>FreeVoice Signaling Server</h1><p>WebSocket endpoint: ws://' + req.headers.host + '</p>');
});

const wss = new WebSocket.Server({ server });
const rooms = new Map();
const peerRooms = new Map();
const peerInfo = new Map();

wss.on('connection', (ws) => {
    console.log('New connection');
    
    ws.on('message', async (data) => {
        const message = JSON.parse(data);
        
        switch (message.type) {
            case 'join':
                const room = message.room;
                let roomData = rooms.get(room) || { peers: new Set() };
                
                if (roomData.peers.size >= MAX_ROOM_SIZE) {
                    ws.send(JSON.stringify({ type: 'error', error: 'Room full' }));
                    return;
                }
                
                roomData.peers.add(ws);
                rooms.set(room, roomData);
                peerRooms.set(ws, room);
                peerInfo.set(ws, message.streamId);
                
                ws.send(JSON.stringify({ type: 'joined', room, peerId: message.streamId }));
                
                roomData.peers.forEach(peer => {
                    if (peer !== ws) {
                        peer.send(JSON.stringify({ type: 'peer-joined', peerId: message.streamId }));
                    }
                });
                break;
                
            case 'offer':
            case 'answer':
            case 'ice-candidate':
            case 'chat':
                const currentRoom = peerRooms.get(ws);
                if (currentRoom) {
                    const roomPeers = rooms.get(currentRoom).peers;
                    const senderInfo = peerInfo.get(ws);
                    message.from = senderInfo;
                    
                    roomPeers.forEach(peer => {
                        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
                            peer.send(JSON.stringify(message));
                        }
                    });
                }
                break;
                
            case 'leave':
                handleLeave(ws);
                break;
        }
    });
    
    ws.on('close', () => handleLeave(ws));
});

function handleLeave(ws) {
    const room = peerRooms.get(ws);
    if (room) {
        const roomData = rooms.get(room);
        if (roomData) {
            roomData.peers.delete(ws);
            
            roomData.peers.forEach(peer => {
                peer.send(JSON.stringify({ type: 'peer-left', peerId: peerInfo.get(ws) }));
            });
            
            if (roomData.peers.size === 0) {
                rooms.delete(room);
            }
        }
    }
    peerRooms.delete(ws);
    peerInfo.delete(ws);
}

server.listen(PORT, () => {
    console.log(`FreeVoice Signaling Server running on port ${PORT}`);
});
