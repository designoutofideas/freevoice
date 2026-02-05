# 🔍 Deployment Verification Checklist

Use this checklist to verify your FreeVoice deployment is working correctly.

## ✅ Pre-Deployment

- [ ] All files are committed to git
- [ ] Dependencies are listed in package.json
- [ ] .gitignore excludes node_modules and sensitive files
- [ ] Environment variables are configured (if needed)

## 🐳 Docker Deployment

### Build Test
```bash
docker build -t freevoice:test .
```
- [ ] Docker image builds successfully
- [ ] No security vulnerabilities reported
- [ ] Image size is reasonable (< 100MB)

### Run Test
```bash
docker run -d -p 8888:8888 --name freevoice-test freevoice:test
docker logs freevoice-test
```
- [ ] Container starts without errors
- [ ] "FreeVoice Signaling Server running on port 8888" message appears
- [ ] Container stays running (not crashing)

### Health Check
```bash
curl http://localhost:8888
```
- [ ] Returns HTML response with "FreeVoice Signaling Server"
- [ ] HTTP status code is 200

### Cleanup
```bash
docker stop freevoice-test
docker rm freevoice-test
```

## 🎯 Heroku Deployment

- [ ] Procfile exists and contains correct start command
- [ ] package.json has "engines" field specified
- [ ] App deploys successfully
- [ ] `heroku logs --tail` shows server running
- [ ] App URL is accessible (e.g., https://your-app.herokuapp.com)
- [ ] WebSocket endpoint is accessible

## 📄 GitHub Pages Deployment

- [ ] Workflow file exists at `.github/workflows/deploy-pages.yml`
- [ ] GitHub Pages is enabled in repository settings
- [ ] Pages deployment succeeds (check Actions tab)
- [ ] Site is accessible at `https://username.github.io/freevoice/`
- [ ] All static assets load (CSS, JS, HTML)
- [ ] No 404 errors in browser console

## 🌐 WebSocket Connection

### Frontend Test
1. Open deployed frontend URL
2. Open browser developer console (F12)
3. Look for WebSocket connection messages

- [ ] No WebSocket connection errors
- [ ] "WebSocket connected" message appears (or similar)
- [ ] Connection status shows "Connected"

### Server Test
```bash
# If using wscat tool
npm install -g wscat
wscat -c ws://localhost:8888

# Or wss:// for production
wscat -c wss://your-domain.com
```
- [ ] Connection established
- [ ] Can send/receive messages
- [ ] Server responds to ping

## 🎥 WebRTC Functionality

### Room Creation
- [ ] "Create Room" button works
- [ ] Room ID is generated
- [ ] Room ID can be copied
- [ ] Optional password can be set

### Room Joining
- [ ] Can join room with valid Room ID
- [ ] Password protection works (if enabled)
- [ ] Cannot join non-existent room
- [ ] Error messages display correctly

### Media Permissions
- [ ] Browser asks for camera permission
- [ ] Browser asks for microphone permission
- [ ] Can grant/deny permissions
- [ ] Error handling works for denied permissions

### Video/Audio
- [ ] Local video preview appears
- [ ] Audio level indicator works
- [ ] Can mute/unmute microphone
- [ ] Can enable/disable camera
- [ ] Quality presets work

### Peer Connection
- [ ] Can see remote participant video
- [ ] Can hear remote participant audio
- [ ] Multiple participants work (if applicable)
- [ ] Connection is stable (no frequent disconnects)

### Features
- [ ] Screen sharing works
- [ ] Chat messages send/receive
- [ ] Recording starts/stops
- [ ] Recording downloads successfully
- [ ] Settings can be changed

## 🔒 Security Checks

### HTTPS/WSS (Production Only)
- [ ] Site uses HTTPS (not HTTP)
- [ ] WebSocket uses WSS (not WS)
- [ ] Valid SSL certificate
- [ ] No mixed content warnings

### Permissions
- [ ] Container runs as non-root user (Docker)
- [ ] No sensitive data in logs
- [ ] Environment variables are secured
- [ ] No credentials in source code

## 📊 Performance

### Load Testing
- [ ] Server handles multiple concurrent connections
- [ ] Memory usage is reasonable
- [ ] CPU usage is acceptable
- [ ] No memory leaks during extended operation

### Network
- [ ] ICE candidates are exchanged successfully
- [ ] STUN servers are reachable
- [ ] Video/audio quality is acceptable
- [ ] Latency is low (< 500ms)

## 🐛 Error Handling

### Test Scenarios
- [ ] Handle lost WebSocket connection (refresh page)
- [ ] Handle network interruption
- [ ] Handle peer disconnect
- [ ] Handle invalid room ID
- [ ] Handle permission denied
- [ ] Display user-friendly error messages

## 📱 Cross-Platform

### Browsers
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari (if applicable)
- [ ] Works in Edge

### Devices
- [ ] Works on Desktop
- [ ] Works on Mobile (if applicable)
- [ ] Works on Tablet (if applicable)
- [ ] Responsive design works

## 📝 Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT.md has accurate instructions
- [ ] QUICK-DEPLOY.md is clear and concise
- [ ] Environment variables are documented
- [ ] Configuration options are explained

## 🎉 Final Sign-Off

- [ ] All critical tests passed
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Ready for production use

---

## 🆘 Common Issues

### WebSocket Connection Failed
- Check signaling server is running
- Verify URL in config.js matches deployment
- Ensure firewall allows WebSocket connections
- Check for CORS issues

### No Video/Audio
- Must use HTTPS in production
- Check browser permissions
- Verify camera/microphone are not in use
- Try different browser

### Can't Connect to Peer
- Both users must be in same room
- Verify signaling server is accessible
- Check STUN/TURN server configuration
- Try different network (firewall issue)

---

**Deployment verified!** ✅
