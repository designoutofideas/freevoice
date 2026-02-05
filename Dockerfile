# FreeVoice Docker Configuration
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port for signaling server
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8888', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start signaling server
CMD ["node", "signaling-server.js"]
