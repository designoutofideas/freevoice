# 🚀 Quick Deploy Guide

This guide will help you deploy FreeVoice in minutes.

## ✨ Choose Your Deployment Method

### 🐳 Docker (Recommended for Self-Hosting)

**Fastest way to deploy:**

```bash
# Clone the repository
git clone https://github.com/designoutofideas/freevoice.git
cd freevoice

# Build and run with Docker Compose
docker-compose up -d

# Your app is now running at http://localhost:8888
```

**Or use Docker directly:**

```bash
# Build the image
docker build -t freevoice .

# Run the container
docker run -d -p 8888:8888 --name freevoice freevoice

# Check logs
docker logs freevoice
```

### 🌐 GitHub Pages (Frontend) + Render/Railway (Signaling Server)

This is the best option for a free public deployment.

#### Step 1: Deploy Signaling Server to Render

1. Go to https://render.com (free tier available)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `designoutofideas/freevoice`
4. Configure:
   - **Name**: `freevoice-signaling`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node signaling-server.js`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy your service URL (e.g., `https://freevoice-signaling.onrender.com`)

#### Step 2: Update Configuration

Edit `config.js` line 90 to use your Render URL:

```javascript
signalingServer: {
    url: 'wss://freevoice-signaling.onrender.com',
    // ... rest of config
}
```

Commit and push:

```bash
git add config.js
git commit -m "Update signaling server URL for production"
git push origin main
```

#### Step 3: Enable GitHub Pages

1. Go to your GitHub repository settings
2. Click "Pages" in the left sidebar
3. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click "Save"
5. Wait 2-3 minutes for deployment
6. Your app will be available at: `https://designoutofideas.github.io/freevoice/`

### 🚂 Railway.app (Full Stack - Easiest!)

Railway automatically deploys both frontend and backend.

1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select `designoutofideas/freevoice`
5. Railway auto-detects and deploys
6. Click on the deployment → "Settings" → "Generate Domain"
7. Your app is live! Example: `https://freevoice-production.up.railway.app`

**Configure environment variable (optional):**
- Add `PORT` environment variable with value `8888`

### ☁️ Heroku (Classic Option)

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
heroku login

# Create app
heroku create your-freevoice-app

# Deploy
git push heroku main

# Open your app
heroku open

# Check logs
heroku logs --tail
```

Your app: `https://your-freevoice-app.herokuapp.com`

### 🖥️ VPS/Cloud Server (Full Control)

**For Ubuntu/Debian servers:**

```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
cd /var/www
sudo git clone https://github.com/designoutofideas/freevoice.git
cd freevoice

# Install dependencies
npm install --production

# Start with PM2
pm2 start signaling-server.js --name freevoice

# Make it run on system boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs freevoice
```

**Setup Nginx reverse proxy (optional):**

```bash
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/freevoice
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/freevoice;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /ws {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/freevoice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Add SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 Post-Deployment Configuration

### Update Signaling Server URL

After deploying your signaling server, update `config.js`:

```javascript
signalingServer: {
    url: 'wss://your-actual-deployment-url.com'
}
```

### Environment Variables

Set these environment variables on your hosting platform:

- `PORT` - Server port (default: 8888)
- `NODE_ENV` - Set to `production`
- `SIGNALING_SERVER_URL` - Your WebSocket server URL (optional)

### CORS Configuration (if needed)

If your frontend and backend are on different domains, you may need to configure CORS in `signaling-server.js`.

## ✅ Testing Your Deployment

1. **Open your deployed URL** in a browser
2. **Check browser console** - should show "Connected to signaling server"
3. **Create a room** - click "Create Room"
4. **Join from another device/browser** - use the room code
5. **Test video/audio** - verify peer connection works
6. **Test recording** - try recording a session

## 📊 Monitoring

### Check Server Logs

**Docker:**
```bash
docker logs freevoice
```

**PM2:**
```bash
pm2 logs freevoice
```

**Heroku:**
```bash
heroku logs --tail
```

**Render/Railway:**
Check the dashboard for real-time logs

### Health Check

Visit your signaling server URL directly:
- Should show: "FreeVoice Signaling Server" message
- Example: `https://your-server.com`

## 🔒 Security Recommendations

- ✅ Always use HTTPS in production (required for WebRTC)
- ✅ Enable room passwords for sensitive meetings
- ✅ Keep Node.js and dependencies updated
- ✅ Configure firewall rules
- ✅ Monitor server logs regularly
- ✅ Use strong passwords for server access
- ✅ Consider adding rate limiting

## 🆘 Troubleshooting

**Problem:** Can't connect to signaling server
- Check if server is running: `curl https://your-server.com`
- Verify `config.js` has correct URL
- Check firewall allows WebSocket connections

**Problem:** Camera/mic not working
- Must use HTTPS (not HTTP)
- Check browser permissions
- Try different browser (Chrome/Firefox recommended)

**Problem:** Peer connection fails
- Check both users are in same room
- Verify STUN servers are accessible
- Try from different network

## 📞 Need Help?

- 📖 Check full documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Report issues: https://github.com/designoutofideas/freevoice/issues
- 💬 Join discussions: https://github.com/designoutofideas/freevoice/discussions

## 🎉 Success!

Once deployed, share your FreeVoice instance with:
- Journalists and reporters
- Human rights organizations  
- Rural and remote communities
- Anyone who needs secure communication

---

**Made with ❤️ for freedom of speech worldwide** 🌍
