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
git clone https://github.com/YOUR-USERNAME/freevoice.git
cd freevoice
npm install
npm start
```

Open `index.html` in your browser at `http://localhost:8080`

## 📖 Usage

**Create Room:** Click "Create Room" → Set password (optional) → Share Room ID

**Join Room:** Click "Join Room" → Enter Room ID → Connect

**URL Parameters:**
```
?room=ABC123&password=secret&quality=medium&name=Reporter
```

## ⚙️ Deployment

### Docker
```bash
docker build -t freevoice .
docker run -d -p 8888:8888 freevoice
```

### Heroku
```bash
heroku create
git push heroku main
```

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
