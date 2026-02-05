#!/bin/bash

# FreeVoice Deployment Helper Script
# This script helps you deploy FreeVoice quickly

set -e

echo "🗣️  FreeVoice Deployment Helper"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker is installed"
        return 0
    else
        echo -e "${RED}✗${NC} Docker is not installed"
        return 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✓${NC} Node.js is installed ($(node --version))"
        return 0
    else
        echo -e "${RED}✗${NC} Node.js is not installed"
        return 1
    fi
}

# Function to deploy with Docker
deploy_docker() {
    echo ""
    echo "🐳 Deploying with Docker..."
    
    if ! check_docker; then
        echo -e "${YELLOW}Please install Docker first: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    echo ""
    echo "Building Docker image..."
    docker build -t freevoice .
    
    echo ""
    echo "Starting container..."
    docker run -d -p 8888:8888 --name freevoice --restart unless-stopped freevoice
    
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
    echo "Your FreeVoice instance is running at:"
    echo "  🌐 http://localhost:8888"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker logs freevoice"
    echo "  Stop server:  docker stop freevoice"
    echo "  Start server: docker start freevoice"
    echo "  Remove:       docker stop freevoice && docker rm freevoice"
}

# Function to deploy with Docker Compose
deploy_compose() {
    echo ""
    echo "🐳 Deploying with Docker Compose..."
    
    if ! check_docker; then
        echo -e "${YELLOW}Please install Docker first: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}✗${NC} Docker Compose is not installed"
        echo -e "${YELLOW}Please install Docker Compose: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    
    echo ""
    echo "Starting services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
    echo "Your FreeVoice instance is running at:"
    echo "  🌐 http://localhost:8888"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop server:  docker-compose stop"
    echo "  Start server: docker-compose start"
    echo "  Remove:       docker-compose down"
}

# Function to deploy locally with Node.js
deploy_local() {
    echo ""
    echo "📦 Deploying locally with Node.js..."
    
    if ! check_node; then
        echo -e "${YELLOW}Please install Node.js first: https://nodejs.org/${NC}"
        exit 1
    fi
    
    echo ""
    echo "Installing dependencies..."
    npm install
    
    echo ""
    echo "Starting signaling server..."
    echo -e "${YELLOW}Note: This will run in the foreground. Press Ctrl+C to stop.${NC}"
    echo ""
    
    node signaling-server.js
}

# Function to deploy with PM2
deploy_pm2() {
    echo ""
    echo "⚡ Deploying with PM2..."
    
    if ! check_node; then
        echo -e "${YELLOW}Please install Node.js first: https://nodejs.org/${NC}"
        exit 1
    fi
    
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}Installing PM2...${NC}"
        npm install -g pm2
    else
        echo -e "${GREEN}✓${NC} PM2 is installed"
    fi
    
    echo ""
    echo "Installing dependencies..."
    npm install --production
    
    echo ""
    echo "Starting with PM2..."
    pm2 start signaling-server.js --name freevoice
    pm2 save
    
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
    echo "Your FreeVoice instance is running at:"
    echo "  🌐 http://localhost:8888"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    pm2 logs freevoice"
    echo "  Stop server:  pm2 stop freevoice"
    echo "  Restart:      pm2 restart freevoice"
    echo "  Status:       pm2 status"
    echo "  Remove:       pm2 delete freevoice"
}

# Main menu
show_menu() {
    echo "Choose your deployment method:"
    echo ""
    echo "  1) Docker (recommended for containers)"
    echo "  2) Docker Compose (recommended for development)"
    echo "  3) Local Node.js (simple, foreground)"
    echo "  4) PM2 (recommended for production VPS)"
    echo "  5) Show deployment guides"
    echo "  6) Exit"
    echo ""
}

# Main script
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                deploy_docker
                break
                ;;
            2)
                deploy_compose
                break
                ;;
            3)
                deploy_local
                break
                ;;
            4)
                deploy_pm2
                break
                ;;
            5)
                echo ""
                echo "📚 Deployment Guides:"
                echo ""
                echo "  Quick Deploy Guide:    QUICK_DEPLOY.md"
                echo "  Full Guide:            DEPLOYMENT.md"
                echo "  GitHub Pages:          https://github.com/designoutofideas/freevoice#deployment"
                echo "  Railway:               https://railway.app"
                echo "  Render:                https://render.com"
                echo "  Heroku:                https://heroku.com"
                echo ""
                ;;
            6)
                echo "Goodbye! 👋"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Please try again.${NC}"
                echo ""
                ;;
        esac
    done
}

# Run main function
main
