/**
 * FreeVoice Configuration
 * Based on VDO.Ninja architecture
 */

const FreeVoiceConfig = {
    // Application version
    version: '1.0.0',
    
    // WebRTC Configuration
    rtcConfig: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun.services.mozilla.com' }
            // Add TURN servers for production:
            // {
            //     urls: 'turn:your-turn-server.com:3478',
            //     username: 'username',
            //     credential: 'password'
            // }
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 10
    },
    
    // Quality Presets (optimized for low-bandwidth)
    qualityPresets: {
        low: {
            video: {
                width: { ideal: 426 },
                height: { ideal: 240 },
                frameRate: { ideal: 15, max: 20 }
            },
            bitrate: 200000, // 200 kbps
            label: '240p - Rural/3G'
        },
        medium: {
            video: {
                width: { ideal: 640 },
                height: { ideal: 360 },
                frameRate: { ideal: 24, max: 30 }
            },
            bitrate: 500000, // 500 kbps
            label: '360p - Standard'
        },
        high: {
            video: {
                width: { ideal: 854 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 }
            },
            bitrate: 1000000, // 1 Mbps
            label: '480p - Good Quality'
        },
        hd: {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            },
            bitrate: 2000000, // 2 Mbps
            label: '720p HD'
        },
        fhd: {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
            },
            bitrate: 4000000, // 4 Mbps
            label: '1080p Full HD'
        }
    },
    
    // Audio Constraints
    audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
    },
    
    // Signaling Server (replace with your server)
    signalingServer: {
        url: 'freevoice-production.up.railway.app',
        reconnectDelay: 2000,
        maxReconnectAttempts: 5
    },
    
    // Room Settings
    room: {
        maxParticipants: 8,
        defaultQuality: 'medium',
        enableChat: true,
        enableRecording: true,
        enableScreenShare: true
    },
    
    // UI Settings
    ui: {
        theme: 'dark', // 'dark' or 'light'
        language: 'en', // 'en', 'es', 'fr', 'ar', etc.
        showStats: true,
        defaultView: 'grid' // 'grid', 'speaker', 'sidebar'
    },
    
    // Recording Settings
    recording: {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
    },
    
    // Privacy & Security
    privacy: {
        enableE2E: false, // End-to-end encryption (experimental)
        doNotTrack: true,
        anonymousMode: false
    },
    
    // Features
    features: {
        multiParty: true,
        screenSharing: true,
        recording: true,
        chat: true,
        virtualBackground: false, // Future feature
        audioOnly: true,
        directMessage: false // Future feature
    },
    
    // URL Parameters Support (VDO.Ninja style)
    urlParams: {
        // ?room=ROOMID
        room: null,
        // ?push=STREAMID
        push: null,
        // ?view=STREAMID
        view: null,
        // ?quality=medium
        quality: null,
        // ?audio=1 or ?audio=0
        audio: null,
        // ?video=1 or ?video=0  
        video: null,
        // ?password=PASSWORD
        password: null,
        // ?name=DISPLAYNAME
        name: null,
        // ?director
        director: false,
        // ?scene
        scene: false,
        // ?bitrate=2000
        bitrate: null
    },
    
    // Stats Update Interval (ms)
    statsInterval: 1000,
    
    // Bandwidth Adaptation
    adaptation: {
        enabled: true,
        minBitrate: 100000,
        maxBitrate: 5000000,
        degradationPreference: 'maintain-framerate' // or 'maintain-resolution', 'balanced'
    },
    
    // Logging
    logging: {
        level: 'info', // 'debug', 'info', 'warn', 'error'
        console: true,
        remote: false
    }
};

// Parse URL parameters on load
function parseURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('room')) {
        FreeVoiceConfig.urlParams.room = urlParams.get('room');
    }
    if (urlParams.has('push')) {
        FreeVoiceConfig.urlParams.push = urlParams.get('push');
    }
    if (urlParams.has('view')) {
        FreeVoiceConfig.urlParams.view = urlParams.get('view');
    }
    if (urlParams.has('quality')) {
        FreeVoiceConfig.urlParams.quality = urlParams.get('quality');
    }
    if (urlParams.has('audio')) {
        FreeVoiceConfig.urlParams.audio = urlParams.get('audio') === '1';
    }
    if (urlParams.has('video')) {
        FreeVoiceConfig.urlParams.video = urlParams.get('video') === '1';
    }
    if (urlParams.has('password')) {
        FreeVoiceConfig.urlParams.password = urlParams.get('password');
    }
    if (urlParams.has('name')) {
        FreeVoiceConfig.urlParams.name = urlParams.get('name');
    }
    if (urlParams.has('director')) {
        FreeVoiceConfig.urlParams.director = true;
    }
    if (urlParams.has('scene')) {
        FreeVoiceConfig.urlParams.scene = true;
    }
    if (urlParams.has('bitrate')) {
        FreeVoiceConfig.urlParams.bitrate = parseInt(urlParams.get('bitrate'));
    }
}

// Load saved settings from localStorage
function loadSavedSettings() {
    const savedSettings = localStorage.getItem('freevoice_settings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            if (settings.signalingServer) {
                FreeVoiceConfig.signalingServer.url = settings.signalingServer;
            }
            if (settings.theme) {
                FreeVoiceConfig.ui.theme = settings.theme;
            }
            if (settings.language) {
                FreeVoiceConfig.ui.language = settings.language;
            }
            if (settings.audioConstraints) {
                Object.assign(FreeVoiceConfig.audioConstraints, settings.audioConstraints);
            }
        } catch (e) {
            console.error('Failed to load saved settings:', e);
        }
    }
}

// Save settings to localStorage
function saveSettings(settings) {
    try {
        localStorage.setItem('freevoice_settings', JSON.stringify(settings));
        return true;
    } catch (e) {
        console.error('Failed to save settings:', e);
        return false;
    }
}

// Utility: Generate room ID
function generateRoomId(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Utility: Generate stream ID
function generateStreamId() {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
}

// Utility: Logger
const Logger = {
    debug: (...args) => {
        if (FreeVoiceConfig.logging.level === 'debug' && FreeVoiceConfig.logging.console) {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (['debug', 'info'].includes(FreeVoiceConfig.logging.level) && FreeVoiceConfig.logging.console) {
            console.log('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(FreeVoiceConfig.logging.level) && FreeVoiceConfig.logging.console) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args) => {
        if (FreeVoiceConfig.logging.console) {
            console.error('[ERROR]', ...args);
        }
    }
};

// Initialize configuration
parseURLParameters();
loadSavedSettings();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FreeVoiceConfig,
        generateRoomId,
        generateStreamId,
        saveSettings,
        Logger
    };
}
