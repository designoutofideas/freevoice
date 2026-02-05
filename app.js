/**
 * FreeVoice Main Application
 * Connects UI with WebRTC functionality
 */

class FreeVoiceApp {
    constructor() {
        this.webrtc = new FreeVoiceWebRTC();
        this.recorder = null;
        this.recordedChunks = [];
        this.recordingStartTime = null;
        this.recordingInterval = null;
        this.currentPage = 'home';
        this.remotePeers = new Map(); // Store remote peer info
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupWebRTCCallbacks();
        this.populateDeviceSelects();
        this.checkURLParameters();
    }
    
    // Setup all UI event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigate Page(page);
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Create room button
        document.getElementById('createRoomBtn')?.addEventListener('click', () => {
            this.showModal('createRoomModal');
        });
        
        // Join room button
        document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
            this.showModal('joinRoomModal');
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
                    this.closeAllModals();
                }
            });
        });
        
        // Create room confirm
        document.getElementById('confirmCreate')?.addEventListener('click', () => {
            this.createRoom();
        });
        
        // Join room confirm
        document.getElementById('confirmJoin')?.addEventListener('click', () => {
            this.joinRoom();
        });
        
        // Cancel buttons
        document.getElementById('cancelCreate')?.addEventListener('click', () => {
            this.closeAllModals();
        });
        
        document.getElementById('cancelJoin')?.addEventListener('click', () => {
            this.closeAllModals();
        });
        
        // Room controls
        document.getElementById('copyRoomId')?.addEventListener('click', () => {
            this.copyRoomId();
        });
        
        document.getElementById('toggleChat')?.addEventListener('click', () => {
            this.toggleChat();
        });
        
        document.getElementById('shareScreen')?.addEventListener('click', () => {
            this.shareScreen();
        });
        
        document.getElementById('recordBtn')?.addEventListener('click', () => {
            this.toggleRecording();
        });
        
        document.getElementById('leaveRoom')?.addEventListener('click', () => {
            this.leaveRoom();
        });
        
        // Local media controls
        document.getElementById('toggleLocalVideo')?.addEventListener('click', () => {
            this.toggleLocalVideo();
        });
        
        document.getElementById('toggleLocalAudio')?.addEventListener('click', () => {
            this.toggleLocalAudio();
        });
        
        // Chat
        document.getElementById('sendMessage')?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        document.getElementById('closeChatBtn')?.addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Settings
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Device changes
        document.getElementById('cameraSelect')?.addEventListener('change', (e) => {
            this.webrtc.switchCamera(e.target.value);
        });
    }
    
    // Setup WebRTC callbacks
    setupWebRTCCallbacks() {
        this.webrtc.onRemoteStream = (peerId, stream) => {
            this.addRemoteVideo(peerId, stream);
        };
        
        this.webrtc.onPeerConnected = (peerId) => {
            this.showToast(`Peer connected: ${peerId}`, 'success');
            this.updateParticipantCount();
        };
        
        this.webrtc.onPeerDisconnected = (peerId) => {
            this.removeRemoteVideo(peerId);
            this.showToast(`Peer disconnected: ${peerId}`, 'info');
            this.updateParticipantCount();
        };
        
        this.webrtc.onSignalingStateChange = (state) => {
            Logger.info('Signaling state:', state);
        };
        
        this.webrtc.onStats = (peerId, stats) => {
            this.updateStats(stats);
        };
        
        this.webrtc.onChatMessage = (from, text, timestamp) => {
            this.addChatMessage(from, text, timestamp);
        };
    }
    
    // Check URL parameters and auto-join if present
    async checkURLParameters() {
        const urlParams = FreeVoiceConfig.urlParams;
        
        if (urlParams.room) {
            // Auto-join room from URL
            document.getElementById('joinRoomId').value = urlParams.room;
            
            if (urlParams.password) {
                document.getElementById('joinRoomPassword').value = urlParams.password;
            }
            
            if (urlParams.name) {
                document.getElementById('displayName').value = urlParams.name;
            }
            
            if (urlParams.quality) {
                document.getElementById('joinQualityPreset').value = urlParams.quality;
            }
            
            // Show join modal
            this.showModal('joinRoomModal');
        }
        
        if (urlParams.director) {
            // Auto-create director room
            this.showModal('createRoomModal');
            document.querySelector('input[name="role"][value="director"]').checked = true;
        }
    }
    
    // Navigate to a different page
    navigatePage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(`${pageName}Page`)?.classList.add('active');
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        this.currentPage = pageName;
    }
    
    // Show modal
    showModal(modalId) {
        document.getElementById(modalId)?.classList.add('active');
    }
    
    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Create a new room
    async createRoom() {
        const roomName = document.getElementById('roomName').value || 'Unnamed Room';
        const roomPassword = document.getElementById('roomPassword').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const quality = document.getElementById('qualityPreset').value;
        const audioOnly = document.getElementById('audioOnly').checked;
        const anonymous = document.getElementById('anonymousMode').checked;
        
        try {
            // Connect to signaling server
            await this.webrtc.connectSignaling();
            
            // Initialize local media
            const stream = await this.webrtc.initialize({
                video: !audioOnly && !anonymous,
                audio: true,
                quality: quality,
                audioOnly: audioOnly
            });
            
            // Display local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = stream;
            }
            
            // Generate room ID
            const roomId = generateRoomId();
            
            // Join room
            await this.webrtc.joinRoom(roomId, {
                role: role,
                password: roomPassword,
                name: roomName
            });
            
            // Update UI
            document.getElementById('currentRoomName').textContent = roomName;
            document.getElementById('displayRoomId').textContent = roomId;
            
            this.closeAllModals();
            this.navigatePage('director');
            
            this.showToast('Room created successfully!', 'success');
            
        } catch (error) {
            Logger.error('Failed to create room:', error);
            this.showToast('Failed to create room: ' + error.message, 'error');
        }
    }
    
    // Join an existing room
    async joinRoom() {
        const roomId = document.getElementById('joinRoomId').value.trim();
        const roomPassword = document.getElementById('joinRoomPassword').value;
        const displayName = document.getElementById('displayName').value || 'Guest';
        const quality = document.getElementById('joinQualityPreset').value;
        const audioOnly = document.getElementById('joinAudioOnly').checked;
        
        if (!roomId) {
            this.showToast('Please enter a Room ID', 'error');
            return;
        }
        
        try {
            // Connect to signaling server
            await this.webrtc.connectSignaling();
            
            // Initialize local media
            const stream = await this.webrtc.initialize({
                video: !audioOnly,
                audio: true,
                quality: quality,
                audioOnly: audioOnly
            });
            
            // Display local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = stream;
            }
            
            // Join room
            await this.webrtc.joinRoom(roomId, {
                role: 'guest',
                password: roomPassword,
                name: displayName
            });
            
            // Update UI
            document.getElementById('currentRoomName').textContent = displayName + "'s Session";
            document.getElementById('displayRoomId').textContent = roomId;
            
            this.closeAllModals();
            this.navigatePage('director');
            
            this.showToast('Joined room successfully!', 'success');
            
        } catch (error) {
            Logger.error('Failed to join room:', error);
            this.showToast('Failed to join room: ' + error.message, 'error');
        }
    }
    
    // Add remote video to grid
    addRemoteVideo(peerId, stream) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;
        
        // Remove if already exists
        this.removeRemoteVideo(peerId);
        
        const videoTile = document.createElement('div');
        videoTile.className = 'video-tile';
        videoTile.id = `peer-${peerId}`;
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsinline = true;
        video.srcObject = stream;
        
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.innerHTML = `
            <div class="video-label">Remote: ${peerId.substring(0, 6)}</div>
        `;
        
        videoTile.appendChild(video);
        videoTile.appendChild(overlay);
        videoGrid.appendChild(videoTile);
        
        this.remotePeers.set(peerId, { stream, element: videoTile });
    }
    
    // Remove remote video from grid
    removeRemoteVideo(peerId) {
        const peerInfo = this.remotePeers.get(peerId);
        if (peerInfo) {
            peerInfo.element.remove();
            this.remotePeers.delete(peerId);
        }
    }
    
    // Toggle local video
    toggleLocalVideo() {
        const video = document.getElementById('localVideo');
        const btn = document.getElementById('toggleLocalVideo');
        
        if (video && video.srcObject) {
            const videoTrack = video.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                const enabled = !videoTrack.enabled;
                this.webrtc.toggleVideo(enabled);
                btn.style.opacity = enabled ? '1' : '0.5';
            }
        }
    }
    
    // Toggle local audio
    toggleLocalAudio() {
        const video = document.getElementById('localVideo');
        const btn = document.getElementById('toggleLocalAudio');
        
        if (video && video.srcObject) {
            const audioTrack = video.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                const enabled = !audioTrack.enabled;
                this.webrtc.toggleAudio(enabled);
                btn.style.opacity = enabled ? '1' : '0.5';
            }
        }
    }
    
    // Copy room ID to clipboard
    async copyRoomId() {
        const roomId = document.getElementById('displayRoomId').textContent;
        try {
            await navigator.clipboard.writeText(roomId);
            this.showToast('Room ID copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy Room ID', 'error');
        }
    }
    
    // Toggle chat sidebar
    toggleChat() {
        const chatSidebar = document.getElementById('chatSidebar');
        chatSidebar?.classList.toggle('active');
    }
    
    // Send chat message
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (text) {
            this.webrtc.sendChat(text);
            this.addChatMessage('You', text, Date.now(), true);
            input.value = '';
        }
    }
    
    // Add chat message to display
    addChatMessage(from, text, timestamp, isOwn = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isOwn ? 'own' : 'remote'}`;
        messageDiv.innerHTML = `
            <div class="message-sender">${from}</div>
            <div class="message-text">${this.escapeHtml(text)}</div>
            <div class="message-time">${new Date(timestamp).toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Share screen
    async shareScreen() {
        try {
            await this.webrtc.startScreenShare();
            this.showToast('Screen sharing started', 'success');
        } catch (error) {
            this.showToast('Failed to share screen', 'error');
        }
    }
    
    // Toggle recording
    async toggleRecording() {
        if (!this.recorder || this.recorder.state === 'inactive') {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    // Start recording
    async startRecording() {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo && localVideo.srcObject) {
                ctx.drawImage(localVideo, 0, 0, 960, 1080);
            }
            
            // Draw remote videos
            let x = 960;
            this.remotePeers.forEach((peer) => {
                const video = peer.element.querySelector('video');
                if (video) {
                    ctx.drawImage(video, x, 0, 960, 1080);
                }
            });
            
            if (this.recorder && this.recorder.state === 'recording') {
                requestAnimationFrame(draw);
            }
        };
        
        const canvasStream = canvas.captureStream(30);
        const combinedStream = new MediaStream(canvasStream.getVideoTracks());
        
        this.recorder = new MediaRecorder(combinedStream, FreeVoiceConfig.recording);
        this.recordedChunks = [];
        
        this.recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
        
        this.recorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `freevoice-${Date.now()}.webm`;
            a.click();
            
            document.getElementById('recordingIndicator').classList.remove('active');
            clearInterval(this.recordingInterval);
        };
        
        this.recorder.start();
        draw();
        
        document.getElementById('recordingIndicator').classList.add('active');
        this.recordingStartTime = Date.now();
        
        this.recordingInterval = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('recordingTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        this.showToast('Recording started', 'success');
    }
    
    // Stop recording
    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
            this.showToast('Recording stopped', 'success');
        }
    }
    
    // Leave room
    async leaveRoom() {
        if (confirm('Are you sure you want to leave the room?')) {
            if (this.recorder && this.recorder.state === 'recording') {
                this.stopRecording();
            }
            
            await this.webrtc.leaveRoom();
            
            this.remotePeers.clear();
            document.getElementById('videoGrid').innerHTML = `
                <div class="video-tile local-video">
                    <video id="localVideo" autoplay muted playsinline></video>
                    <div class="video-overlay">
                        <div class="video-label">You (Local)</div>
                        <div class="video-controls">
                            <button class="control-btn" id="toggleLocalVideo">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                                </svg>
                            </button>
                            <button class="control-btn" id="toggleLocalAudio">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            this.navigatePage('home');
            this.showToast('Left the room', 'info');
        }
    }
    
    // Update statistics display
    updateStats(stats) {
        document.getElementById('statBitrate').textContent = `${stats.bitrate} kbps`;
        document.getElementById('statLatency').textContent = `${stats.latency} ms`;
        document.getElementById('statPackets').textContent = stats.packetsLost;
    }
    
    // Update participant count
    updateParticipantCount() {
        const count = 1 + this.remotePeers.size; // 1 for self + remote peers
        document.getElementById('statParticipants').textContent = count;
    }
    
    // Populate device selects
    async populateDeviceSelects() {
        const devices = await this.webrtc.getDevices();
        
        const cameraSelect = document.getElementById('cameraSelect');
        const microphoneSelect = document.getElementById('microphoneSelect');
        const speakerSelect = document.getElementById('speakerSelect');
        
        if (cameraSelect) {
            devices.cameras.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Camera ${cameraSelect.options.length + 1}`;
                cameraSelect.appendChild(option);
            });
        }
        
        if (microphoneSelect) {
            devices.microphones.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Microphone ${microphoneSelect.options.length + 1}`;
                microphoneSelect.appendChild(option);
            });
        }
        
        if (speakerSelect) {
            devices.speakers.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Speaker ${speakerSelect.options.length + 1}`;
                speakerSelect.appendChild(option);
            });
        }
    }
    
    // Save settings
    saveSettings() {
        const settings = {
            signalingServer: document.getElementById('signalingServer').value,
            theme: FreeVoiceConfig.ui.theme,
            audioConstraints: {
                echoCancellation: document.getElementById('echoCancellation').checked,
                noiseSuppression: document.getElementById('noiseSuppression').checked,
                autoGainControl: document.getElementById('autoGainControl').checked
            }
        };
        
        if (saveSettings(settings)) {
            this.showToast('Settings saved successfully!', 'success');
        } else {
            this.showToast('Failed to save settings', 'error');
        }
    }
    
    // Toggle theme
    toggleTheme() {
        // Future implementation for light/dark theme
        this.showToast('Theme toggle coming soon!', 'info');
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.freeVoiceApp = new FreeVoiceApp();
    Logger.info('FreeVoice initialized');
});
