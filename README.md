# 🗣️ FreeVoice

**Speak Freely. Connect Globally.**

Peer-to-peer video conferencing designed to empower freedom of speech, press freedom, and human rights advocacy.

![License](https://img.shields.io/badge/license-MIT-blue)
![WebRTC](https://img.shields.io/badge/WebRTC-enabled-orange)

---

## 🌟 Mission

FreeVoice provides secure, self-hostable communication for journalists, activists, and communities worldwide.

## ✨ Key Features

- 🔒 **True P2P** - No server storage of your video/audio
- 📶 **Low-Bandwidth** - Optimized 240p-1080p presets
- 🎥 **Multi-Party** - Up to 8 participants
- 🖥️ **Screen Sharing** - Share presentations
- 🎬 **Recording** - Save locally
- 💬 **Chat** - Text backup
- 🌐 **Self-Hostable** - Full control

## 🚀 Quick Start

```bash
git clone https://github.com/designoutofideas/freevoice.git
cd freevoice
npm install
npm start
```

Open your browser at `http://localhost:8888`

**Or use our deployment script:**
```bash
./deploy.sh
```

## 📖 Usage

**Create Room:** Click "Create Room" → Set password (optional) → Share Room ID

**Join Room:** Click "Join Room" → Enter Room ID → Connect

**URL Parameters:**
```
?room=ABC123&password=secret&quality=medium&name=Reporter
```

## ⚙️ Deployment

**🚀 Multiple deployment options available!**

### Quick Deploy (Easiest)

Use our deployment script:
```bash
./deploy.sh
```

Choose from Docker, Docker Compose, Node.js, or PM2 deployment.

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Docker (Recommended)

```bash
# Using Docker Compose (easiest)
docker-compose up -d

# Or using Docker directly
docker build -t freevoice .
docker run -d -p 8888:8888 --name freevoice freevoice
```

### Manual Deployment

**Render.com / Railway.app:**
1. Connect your GitHub repository
2. Set start command: `node signaling-server.js`
3. Deploy!

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**VPS/Cloud Server:**
```bash
npm install -g pm2
npm install --production
pm2 start signaling-server.js --name freevoice
pm2 save
```

**📖 Full deployment guide:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎨 Quality Presets

| Preset | Resolution | Bitrate | Best For |
|--------|-----------|---------|----------|
| Low | 240p | 200 kbps | Rural 2G/3G |
| Medium | 360p | 500 kbps | 3G/4G |
| High | 480p | 1 Mbps | Good 4G |
| HD | 720p | 2 Mbps | 4G/5G |
| FHD | 1080p | 4 Mbps | Fiber |

## 🛡️ Security

- Always use HTTPS in production
- Enable room passwords
- Self-host for maximum privacy
- No data collection or tracking

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch  
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Credits

Inspired by [VDO.Ninja](https://vdo.ninja) architecture

---

**Empowering freedom of speech worldwide** 🌍
