#!/bin/bash

echo "🚀 Starting Kafka Flow Visualizer..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Start backend in background
echo -e "${BLUE}Starting backend...${NC}"
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 10

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Services started!${NC}"
echo ""
echo "📊 Backend: http://localhost:8080"
echo "🖥️  Frontend: http://localhost:3000"
echo "📦 H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
