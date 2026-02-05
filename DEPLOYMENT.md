# 🚀 FreeVoice Deployment Guide

Complete guide for deploying FreeVoice to GitHub and various hosting platforms.

## 📦 Repository Setup

### 1. Create GitHub Repository

```bash
# On GitHub.com:
# 1. Click "+" → "New repository"
# 2. Name: freevoice
# 3. Public repository
# 4. Don't add README (we have one)
# 5. Click "Create repository"
```

### 2. Push to GitHub

```bash
# Navigate to your FreeVoice folder
cd /path/to/freevoice

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: FreeVoice - Freedom of speech platform"

# Add your GitHub repo (REPLACE YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/freevoice.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Authentication:**
- Username: Your GitHub username
- Password: Personal Access Token from https://github.com/settings/tokens

## 🌐 Deployment Options

### Option 1: GitHub Pages (Frontend Only)

1. Repository → Settings → Pages
2. Source: Branch `main`, folder `/` (root)
3. Click Save
4. Wait 2 minutes

Your frontend will be at: `https://YOUR-USERNAME.github.io/freevoice/`

**Note:** You still need to deploy the signaling server separately.

### Option 2: Heroku (Full Stack)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create freevoice-app

# Add Procfile
echo "web: node signaling-server.js" > Procfile

# Deploy
git add Procfile
git commit -m "Add Procfile for Heroku"
git push heroku main

# Your signaling server: https://freevoice-app.herokuapp.com
```

Update `config.js` with your Heroku URL:
```javascript
signalingServer: {
    url: 'wss://freevoice-app.herokuapp.com'
}
```

### Option 3: Railway.app (Easiest)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `freevoice` repository
5. Railway auto-detects Node.js and deploys
6. Copy the provided URL
7. Update `config.js` with Railway URL

### Option 4: Render.com

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Name: `freevoice-signaling`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node signaling-server.js`
5. Create Web Service
6. Copy URL (e.g., `https://freevoice-signaling.onrender.com`)

### Option 5: DigitalOcean / VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx

# Clone repository
cd /var/www
git clone https://github.com/YOUR-USERNAME/freevoice.git
cd freevoice

# Install dependencies
npm install

# Install PM2
sudo npm install -g pm2

# Start signaling server
pm2 start signaling-server.js --name freevoice

# Make it start on boot
pm2 startup
pm2 save

# Configure Nginx
sudo nano /etc/nginx/sites-available/freevoice
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    root /var/www/freevoice;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # WebSocket signaling
    location /signal {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/freevoice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Enable HTTPS (Required for Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

## 🔧 Configuration

### Update Signaling Server URL

Edit `config.js`:
```javascript
signalingServer: {
    url: 'wss://your-actual-server.com'
}
```

Or use environment variable in `signaling-server.js`:
```javascript
const PORT = process.env.PORT || 8888;
```

## 🧪 Testing Your Deployment

1. **Test Frontend**: Open your deployed URL in browser
2. **Test Signaling**: Check browser console for WebSocket connection
3. **Test P2P**: Create a room, join from another device
4. **Test Recording**: Record a session, verify download

## 📊 Monitoring

### Heroku
```bash
heroku logs --tail --app freevoice-app
```

### PM2 (VPS)
```bash
pm2 logs freevoice
pm2 status
```

### Railway/Render
Check dashboard for logs and metrics

## 🔒 Security Checklist

- [ ] HTTPS enabled (Let's Encrypt)
- [ ] Firewall configured
- [ ] Node.js updated
- [ ] Dependencies updated (`npm audit`)
- [ ] Room passwords enabled
- [ ] Server logs monitored
- [ ] Backups configured

## 🆘 Troubleshooting

**Problem:** WebSocket connection failed
- Check signaling server is running
- Verify URL in config.js matches deployment
- Ensure firewall allows WebSocket connections

**Problem:** Camera/microphone not working
- Must use HTTPS (not HTTP)
- Check browser permissions
- Try different browser

**Problem:** Can't connect to peer
- Check both users are in same room
- Verify signaling server is accessible
- Try different network (firewall issue)

## 📱 Mobile Deployment

FreeVoice web app works on mobile browsers. For native apps:

### Future: React Native App
```bash
# Coming soon
npx react-native init FreeVoiceApp
```

## 🔄 Updating Your Deployment

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"
git push origin main

# Heroku auto-deploys on push
# Railway/Render auto-deploy on push
# GitHub Pages updates in 1-2 minutes

# VPS: Pull and restart
ssh your-server
cd /var/www/freevoice
git pull
pm2 restart freevoice
```

## 🎉 Success!

Your FreeVoice deployment is complete! Share your instance with:
- Journalists in your region
- Human rights organizations
- Rural communities
- Anyone who needs secure communication

---

**Need help?** Open an issue on GitHub or check discussions.
