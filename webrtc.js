/**
 * FreeVoice WebRTC Module
 * Handles all peer-to-peer connections based on VDO.Ninja architecture
 */

class FreeVoiceWebRTC {
    constructor() {
        this.peers = new Map(); // Map of peer connections
        this.localStream = null;
        this.screenStream = null;
        this.roomId = null;
        this.streamId = null;
        this.role = 'guest'; // 'director' or 'guest'
        this.signalingSocket = null;
        this.reconnectAttempts = 0;
        this.statsIntervals = new Map();
        
        // Event callbacks
        this.onPeerConnected = null;
        this.onPeerDisconnected = null;
        this.onRemoteStream = null;
        this.onSignalingStateChange = null;
        this.onStats = null;
    }
    
    // Initialize WebRTC with local media
    async initialize(options = {}) {
        const {
            video = true,
            audio = true,
            quality = 'medium',
            audioOnly = false
        } = options;
        
        try {
            const preset = FreeVoiceConfig.qualityPresets[quality];
            
            const constraints = {
                audio: audio ? FreeVoiceConfig.audioConstraints : false,
                video: (video && !audioOnly) ? {
                    ...preset.video,
                    facingMode: 'user'
                } : false
            };
            
            Logger.info('Requesting user media with constraints:', constraints);
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Generate stream ID
            this.streamId = generateStreamId();
            
            Logger.info('Local stream acquired:', this.streamId);
            return this.localStream;
            
        } catch (error) {
            Logger.error('Failed to get user media:', error);
            throw new Error(`Media access denied: ${error.message}`);
        }
    }
    
    // Connect to signaling server
    connectSignaling(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.signalingSocket = new WebSocket(serverUrl || FreeVoiceConfig.signalingServer.url);
                
                this.signalingSocket.onopen = () => {
                    Logger.info('Connected to signaling server');
                    this.reconnectAttempts = 0;
                    if (this.onSignalingStateChange) {
                        this.onSignalingStateChange('connected');
                    }
                    resolve();
                };
                
                this.signalingSocket.onclose = () => {
                    Logger.warn('Disconnected from signaling server');
                    if (this.onSignalingStateChange) {
                        this.onSignalingStateChange('disconnected');
                    }
                    this.handleSignalingDisconnect();
                };
                
                this.signalingSocket.onerror = (error) => {
                    Logger.error('Signaling error:', error);
                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
                };
                
                this.signalingSocket.onmessage = async (event) => {
                    await this.handleSignalingMessage(JSON.parse(event.data));
                };
                
            } catch (error) {
                Logger.error('Failed to connect to signaling server:', error);
                reject(error);
            }
        });
    }
    
    // Handle signaling disconnect with reconnection
    handleSignalingDisconnect() {
        if (this.reconnectAttempts < FreeVoiceConfig.signalingServer.maxReconnectAttempts) {
            this.reconnectAttempts++;
            Logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${FreeVoiceConfig.signalingServer.maxReconnectAttempts})`);
            
            if (this.onSignalingStateChange) {
                this.onSignalingStateChange('reconnecting');
            }
            
            setTimeout(() => {
                this.connectSignaling();
            }, FreeVoiceConfig.signalingServer.reconnectDelay * this.reconnectAttempts);
        } else {
            Logger.error('Max reconnection attempts reached');
            if (this.onSignalingStateChange) {
                this.onSignalingStateChange('failed');
            }
        }
    }
    
    // Join or create a room
    async joinRoom(roomId, options = {}) {
        this.roomId = roomId;
        this.role = options.role || 'guest';
        
        const message = {
            type: 'join',
            room: roomId,
            streamId: this.streamId,
            role: this.role,
            ...options
        };
        
        this.sendSignaling(message);
        Logger.info(`Joining room: ${roomId} as ${this.role}`);
    }
    
    // Handle incoming signaling messages
    async handleSignalingMessage(message) {
        Logger.debug('Received signaling message:', message.type);
        
        switch (message.type) {
            case 'joined':
                Logger.info('Successfully joined room:', message.room);
                break;
                
            case 'peer-joined':
                Logger.info('Peer joined:', message.peerId);
                if (this.role === 'director' || message.role === 'director') {
                    await this.createOffer(message.peerId);
                }
                break;
                
            case 'offer':
                await this.handleOffer(message.from, message.offer);
                break;
                
            case 'answer':
                await this.handleAnswer(message.from, message.answer);
                break;
                
            case 'ice-candidate':
                await this.handleIceCandidate(message.from, message.candidate);
                break;
                
            case 'peer-left':
                this.handlePeerLeft(message.peerId);
                break;
                
            case 'error':
                Logger.error('Signaling error:', message.error);
                break;
                
            case 'chat':
                if (this.onChatMessage) {
                    this.onChatMessage(message.from, message.text, message.timestamp);
                }
                break;
        }
    }
    
    // Create peer connection
    createPeerConnection(peerId) {
        const pc = new RTCPeerConnection(FreeVoiceConfig.rtcConfig);
        
        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
                Logger.debug(`Added ${track.kind} track to peer:`, peerId);
            });
        }
        
        // Handle remote tracks
        pc.ontrack = (event) => {
            Logger.info('Received remote track from:', peerId);
            if (this.onRemoteStream) {
                this.onRemoteStream(peerId, event.streams[0]);
            }
        };
        
        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    to: peerId,
                    room: this.roomId
                });
            }
        };
        
        // Handle connection state
        pc.onconnectionstatechange = () => {
            Logger.info(`Peer ${peerId} connection state:`, pc.connectionState);
            
            if (pc.connectionState === 'connected') {
                if (this.onPeerConnected) {
                    this.onPeerConnected(peerId);
                }
                this.startStatsMonitoring(peerId);
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                this.handlePeerLeft(peerId);
            }
        };
        
        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            Logger.debug(`Peer ${peerId} ICE state:`, pc.iceConnectionState);
        };
        
        this.peers.set(peerId, pc);
        return pc;
    }
    
    // Create and send offer
    async createOffer(peerId) {
        Logger.info('Creating offer for peer:', peerId);
        
        const pc = this.createPeerConnection(peerId);
        
        try {
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await pc.setLocalDescription(offer);
            
            this.sendSignaling({
                type: 'offer',
                offer: offer,
                to: peerId,
                room: this.roomId,
                from: this.streamId
            });
            
        } catch (error) {
            Logger.error('Failed to create offer:', error);
        }
    }
    
    // Handle incoming offer
    async handleOffer(peerId, offer) {
        Logger.info('Handling offer from peer:', peerId);
        
        let pc = this.peers.get(peerId);
        if (!pc) {
            pc = this.createPeerConnection(peerId);
        }
        
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            this.sendSignaling({
                type: 'answer',
                answer: answer,
                to: peerId,
                room: this.roomId,
                from: this.streamId
            });
            
        } catch (error) {
            Logger.error('Failed to handle offer:', error);
        }
    }
    
    // Handle incoming answer
    async handleAnswer(peerId, answer) {
        Logger.info('Handling answer from peer:', peerId);
        
        const pc = this.peers.get(peerId);
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                Logger.error('Failed to handle answer:', error);
            }
        }
    }
    
    // Handle incoming ICE candidate
    async handleIceCandidate(peerId, candidate) {
        const pc = this.peers.get(peerId);
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                Logger.error('Failed to add ICE candidate:', error);
            }
        }
    }
    
    // Handle peer disconnect
    handlePeerLeft(peerId) {
        Logger.info('Peer left:', peerId);
        
        const pc = this.peers.get(peerId);
        if (pc) {
            pc.close();
            this.peers.delete(peerId);
        }
        
        this.stopStatsMonitoring(peerId);
        
        if (this.onPeerDisconnected) {
            this.onPeerDisconnected(peerId);
        }
    }
    
    // Start screen sharing
    async startScreenShare() {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: false
            });
            
            // Replace video tracks in all peer connections
            const videoTrack = this.screenStream.getVideoTracks()[0];
            
            this.peers.forEach((pc, peerId) => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
            
            // Handle screen share stop
            videoTrack.onended = () => {
                this.stopScreenShare();
            };
            
            Logger.info('Screen sharing started');
            return this.screenStream;
            
        } catch (error) {
            Logger.error('Failed to start screen share:', error);
            throw error;
        }
    }
    
    // Stop screen sharing
    async stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            
            // Restore camera video
            if (this.localStream) {
                const videoTrack = this.localStream.getVideoTracks()[0];
                if (videoTrack) {
                    this.peers.forEach((pc, peerId) => {
                        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(videoTrack);
                        }
                    });
                }
            }
            
            Logger.info('Screen sharing stopped');
        }
    }
    
    // Toggle local video
    toggleVideo(enabled) {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = enabled;
                Logger.info('Video', enabled ? 'enabled' : 'disabled');
                return true;
            }
        }
        return false;
    }
    
    // Toggle local audio
    toggleAudio(enabled) {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = enabled;
                Logger.info('Audio', enabled ? 'enabled' : 'disabled');
                return true;
            }
        }
        return false;
    }
    
    // Send signaling message
    sendSignaling(message) {
        if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
            this.signalingSocket.send(JSON.stringify(message));
        } else {
            Logger.warn('Cannot send signaling message - socket not connected');
        }
    }
    
    // Send chat message
    sendChat(text) {
        this.sendSignaling({
            type: 'chat',
            text: text,
            from: this.streamId,
            room: this.roomId,
            timestamp: Date.now()
        });
    }
    
    // Start statistics monitoring for a peer
    startStatsMonitoring(peerId) {
        const pc = this.peers.get(peerId);
        if (!pc) return;
        
        const interval = setInterval(async () => {
            try {
                const stats = await pc.getStats();
                const statsData = this.parseStats(stats);
                
                if (this.onStats) {
                    this.onStats(peerId, statsData);
                }
            } catch (error) {
                Logger.error('Failed to get stats:', error);
            }
        }, FreeVoiceConfig.statsInterval);
        
        this.statsIntervals.set(peerId, interval);
    }
    
    // Stop statistics monitoring
    stopStatsMonitoring(peerId) {
        const interval = this.statsIntervals.get(peerId);
        if (interval) {
            clearInterval(interval);
            this.statsIntervals.delete(peerId);
        }
    }
    
    // Parse WebRTC stats
    parseStats(stats) {
        let bitrate = 0;
        let packetsLost = 0;
        let latency = 0;
        let width = 0;
        let height = 0;
        let fps = 0;
        
        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                bitrate = Math.round((report.bytesReceived * 8) / 1000) || 0;
                packetsLost = report.packetsLost || 0;
                width = report.frameWidth || 0;
                height = report.frameHeight || 0;
                fps = report.framesPerSecond || 0;
            }
            
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                latency = report.currentRoundTripTime ? Math.round(report.currentRoundTripTime * 1000) : 0;
            }
        });
        
        return { bitrate, packetsLost, latency, width, height, fps };
    }
    
    // Leave room and cleanup
    async leaveRoom() {
        // Notify server
        if (this.roomId) {
            this.sendSignaling({
                type: 'leave',
                room: this.roomId,
                streamId: this.streamId
            });
        }
        
        // Close all peer connections
        this.peers.forEach((pc, peerId) => {
            pc.close();
            this.stopStatsMonitoring(peerId);
        });
        this.peers.clear();
        
        // Stop local streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
        
        // Close signaling
        if (this.signalingSocket) {
            this.signalingSocket.close();
            this.signalingSocket = null;
        }
        
        this.roomId = null;
        this.streamId = null;
        
        Logger.info('Left room and cleaned up');
    }
    
    // Get list of available media devices
    async getDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                cameras: devices.filter(d => d.kind === 'videoinput'),
                microphones: devices.filter(d => d.kind === 'audioinput'),
                speakers: devices.filter(d => d.kind === 'audiooutput')
            };
        } catch (error) {
            Logger.error('Failed to enumerate devices:', error);
            return { cameras: [], microphones: [], speakers: [] };
        }
    }
    
    // Switch camera
    async switchCamera(deviceId) {
        if (!this.localStream) return false;
        
        try {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const quality = Object.keys(FreeVoiceConfig.qualityPresets)[0]; // Default quality
            const preset = FreeVoiceConfig.qualityPresets[quality];
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    ...preset.video,
                    deviceId: { exact: deviceId }
                }
            });
            
            const newTrack = stream.getVideoTracks()[0];
            
            // Replace track in peer connections
            this.peers.forEach((pc) => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(newTrack);
                }
            });
            
            // Replace in local stream
            if (videoTrack) {
                videoTrack.stop();
                this.localStream.removeTrack(videoTrack);
            }
            this.localStream.addTrack(newTrack);
            
            Logger.info('Switched camera to:', deviceId);
            return true;
            
        } catch (error) {
            Logger.error('Failed to switch camera:', error);
            return false;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeVoiceWebRTC;
}
