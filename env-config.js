/**
 * Environment Configuration Loader
 * Supports environment variables for deployment
 */

// Get signaling server URL from environment or default
function getSignalingServerUrl() {
    // Check for environment variable (used in Node.js context)
    if (typeof process !== 'undefined' && process.env && process.env.SIGNALING_SERVER_URL) {
        return process.env.SIGNALING_SERVER_URL;
    }
    
    // Check for browser window variable (can be set in HTML)
    if (typeof window !== 'undefined' && window.SIGNALING_SERVER_URL) {
        return window.SIGNALING_SERVER_URL;
    }
    
    // Auto-detect based on current location (for GitHub Pages, etc.)
    if (typeof window !== 'undefined' && window.location) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // If on GitHub Pages, use a default public signaling server
        if (host.endsWith('.github.io')) {
            // TODO: Replace with your deployed signaling server URL
            return 'wss://your-signaling-server.onrender.com';
        }
        
        // For local development
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            return 'ws://localhost:8888';
        }
        
        // Default: assume signaling server is on same host
        return `${protocol}//${host}`;
    }
    
    // Fallback
    return 'ws://localhost:8888';
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getSignalingServerUrl };
}
