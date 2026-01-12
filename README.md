# Yucast

Real-time Kafka message monitoring and visualization platform.

## Features

- Real-time message monitoring via WebSocket
- Multi-cluster Kafka connections
- Advanced message search and filtering
- Message archiving with retention policies
- Visual flow diagrams
- Analytics and statistics dashboard

## Quick Start

### Option 1: Setup Wizard (Recommended)

**Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```cmd
scripts\setup.bat
```

### Option 2: Manual Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration

3. Start backend:
```bash
cd backend
mvn spring-boot:run
```

4. Start frontend:
```bash
cd frontend
npm install
npm run dev
```

5. Open http://localhost:5173

## Requirements

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+ (or H2 for demo mode)
- Apache Kafka (optional for demo mode)

## Configuration

All configuration is done via environment variables. See `.env.example` for available options.

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Spring profile (demo, local, prod) | demo |
| `DB_URL` | Database JDBC URL | - |
| `DB_USERNAME` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `KAFKA_BOOTSTRAP_SERVERS` | Default Kafka servers | localhost:9092 |

## Project Structure

```
yucast/
├── backend/          # Spring Boot API
├── frontend/         # React + Vite
├── demo/             # Demo Kafka producer
├── scripts/          # Setup scripts
├── docs/             # Documentation
└── docker/           # Docker configurations
```

## Demo Mode

Demo mode uses an embedded H2 database and requires no external dependencies.

```bash
SPRING_PROFILES_ACTIVE=demo
DEMO_MODE=true
```

## Tech Stack

**Backend:**
- Spring Boot 3
- Spring WebSocket
- Spring Data JPA
- Apache Kafka Client

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Zustand
- Recharts

## License

MIT License - See [LICENSE](LICENSE) for details.