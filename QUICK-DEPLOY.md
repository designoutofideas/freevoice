# 🚀 Quick Deployment Guide

This project now includes deployment configuration files for multiple platforms.

## 📋 What's Included

- ✅ **Dockerfile** - Container deployment for any platform
- ✅ **docker-compose.yml** - Easy Docker Compose deployment
- ✅ **Procfile** - Heroku deployment configuration
- ✅ **.dockerignore** - Optimized Docker builds
- ✅ **GitHub Pages Workflow** - Automatic frontend deployment
- ✅ **Auto-detecting signaling server** - Smart URL configuration

## 🎯 Quick Start Options

### Option 1: Docker
```bash
docker build -t freevoice .
docker run -d -p 8888:8888 freevoice
```

Or using Docker Compose:
```bash
docker-compose up -d
```

### Option 2: Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Option 3: GitHub Pages (Frontend Only)
1. Go to Settings → Pages
2. Enable Pages with source: `main` branch
3. Wait 2 minutes for deployment
4. Access at: `https://your-username.github.io/freevoice/`

Note: You'll need to deploy the signaling server separately (Heroku, Railway, etc.)

### Option 4: Local Development
```bash
npm install
npm start
# Open index.html in browser
```

## 🔧 Configuration

The signaling server URL is now auto-detected based on your deployment:
- **localhost**: `ws://localhost:8888`
- **GitHub Pages**: Requires manual configuration via settings
- **Production domains**: Automatically uses `wss://yourdomain.com`

To override, use:
```javascript
// In browser console or settings
localStorage.setItem('freevoice_settings', JSON.stringify({
  signalingServer: 'wss://your-signaling-server.com'
}));
```

## 🌐 Production Checklist

Before deploying to production:

- [ ] Deploy signaling server (Heroku/Railway/Render/VPS)
- [ ] Configure HTTPS/WSS for production
- [ ] Set signaling server URL in config
- [ ] Test WebRTC connections
- [ ] Enable room passwords
- [ ] Monitor server logs
- [ ] Set up backups (if needed)

## 📚 More Information

See `DEPLOYMENT.md` for detailed deployment instructions for:
- Railway.app
- Render.com
- DigitalOcean / VPS
- SSL/HTTPS setup
- Troubleshooting

## 🆘 Support

If you encounter issues:
1. Check server logs
2. Verify WebSocket connection in browser console
3. Ensure firewall allows WebSocket connections
4. See DEPLOYMENT.md for troubleshooting

---

**Ready to deploy!** Choose your platform and follow the instructions above.
