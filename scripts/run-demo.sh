#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Banner
echo -e "\n${CYAN}╔════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║   Kafka Visualizer - Demo Launcher        ║${RESET}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${RESET}\n"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${RESET}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${RESET}"
    echo "Please install Docker: https://www.docker.com/get-started"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${RESET}"

# Check Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${RESET}"
    echo "Please start Docker Desktop"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${RESET}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${RESET}"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found ($(node --version))${RESET}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed${RESET}"
    echo "Please install Java 21: https://adoptium.net/"
    exit 1
fi
echo -e "${GREEN}✅ Java found${RESET}"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed${RESET}"
    echo "Please install Maven: https://maven.apache.org/install.html"
    exit 1
fi
echo -e "${GREEN}✅ Maven found${RESET}"

echo -e "\n${BLUE}🚀 Starting demo environment...${RESET}\n"

# Step 1: Start Kafka
echo -e "${BLUE}[1/5] Starting Kafka cluster...${RESET}"
cd "$PROJECT_DIR"
docker-compose -f docker-compose.demo.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Kafka${RESET}"
    exit 1
fi
echo -e "${GREEN}✅ Kafka cluster started${RESET}"

# Wait for Kafka
echo -e "${YELLOW}⏳ Waiting for Kafka to be ready (30s)...${RESET}"
sleep 30

# Step 2: Install demo dependencies
echo -e "\n${BLUE}[2/5] Installing demo dependencies...${RESET}"
cd "$PROJECT_DIR/demo"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install demo dependencies${RESET}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Demo dependencies installed${RESET}"

# Step 3: Start backend
echo -e "\n${BLUE}[3/5] Starting backend...${RESET}"
cd "$PROJECT_DIR/backend"
osascript -e 'tell app "Terminal" to do script "cd '"$PROJECT_DIR/backend"' && mvn spring-boot:run"' &> /dev/null || \
gnome-terminal -- bash -c "cd $PROJECT_DIR/backend && mvn spring-boot:run; exec bash" &> /dev/null || \
xterm -e "cd $PROJECT_DIR/backend && mvn spring-boot:run" &> /dev/null &

echo -e "${GREEN}✅ Backend starting in new terminal...${RESET}"

# Wait for backend
echo -e "${YELLOW}⏳ Waiting for backend to start (25s)...${RESET}"
sleep 25

# Step 4: Start frontend
echo -e "\n${BLUE}[4/5] Starting frontend...${RESET}"
cd "$PROJECT_DIR/frontend"
osascript -e 'tell app "Terminal" to do script "cd '"$PROJECT_DIR/frontend"' && npm run dev"' &> /dev/null || \
gnome-terminal -- bash -c "cd $PROJECT_DIR/frontend && npm run dev; exec bash" &> /dev/null || \
xterm -e "cd $PROJECT_DIR/frontend && npm run dev" &> /dev/null &

echo -e "${GREEN}✅ Frontend starting in new terminal...${RESET}"

# Wait for frontend
echo -e "${YELLOW}⏳ Waiting for frontend to start (10s)...${RESET}"
sleep 10

# Step 5: Ready to run demo
echo -e "\n${BLUE}[5/5] Ready to run demo scenario${RESET}\n"
echo -e "${YELLOW}════════════════════════════════════════════${RESET}"
echo -e "${YELLOW}  Demo environment is ready!${RESET}"
echo -e "${YELLOW}════════════════════════════════════════════${RESET}\n"
echo -e "${GREEN}✅ Kafka:    http://localhost:9092${RESET}"
echo -e "${GREEN}✅ Backend:  http://localhost:8080${RESET}"
echo -e "${GREEN}✅ Frontend: http://localhost:5173${RESET}\n"
echo -e "${BLUE}Press Enter to start the demo scenario...${RESET}"
read

echo -e "\n${GREEN}🎬 Starting demo scenario...${RESET}"
cd "$PROJECT_DIR/demo"
osascript -e 'tell app "Terminal" to do script "cd '"$PROJECT_DIR/demo"' && npm start"' &> /dev/null || \
gnome-terminal -- bash -c "cd $PROJECT_DIR/demo && npm start; exec bash" &> /dev/null || \
xterm -e "cd $PROJECT_DIR/demo && npm start" &> /dev/null &

echo -e "\n${GREEN}════════════════════════════════════════════${RESET}"
echo -e "${GREEN}  Demo is running! 🎉${RESET}"
echo -e "${GREEN}════════════════════════════════════════════${RESET}\n"
echo -e "Open your browser: ${CYAN}http://localhost:5173${RESET}\n"
echo -e "The demo will run for approximately 3.5 minutes"
echo -e "Watch the dashboard for real-time updates!\n"
echo -e "${YELLOW}Press Enter to stop all services when done...${RESET}"
read

echo -e "\n${BLUE}🛑 Stopping services...${RESET}"

# Stop Kafka
cd "$PROJECT_DIR"
docker-compose -f docker-compose.demo.yml down
echo -e "${GREEN}✅ Kafka stopped${RESET}"

# Note about other services
echo -e "\n${YELLOW}⚠️  Please manually close the backend and frontend terminal windows${RESET}\n"

echo -e "${GREEN}✅ Demo complete! Thank you!${RESET}\n"
