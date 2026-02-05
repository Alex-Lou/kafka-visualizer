# Yucast
**Real-time Kafka message monitoring and visualization platform.**

Yucast bridges the gap between complex Kafka streams and human-readable insights. It provides real-time data flow visualization, message retention management, and system health monitoring in a single, unified dashboard.

---

## Key Features

* **Real-time Monitoring:** Watch messages flow through your topics via WebSocket.
* **Multi-Cluster Support:** Manage multiple Kafka connections simultaneously.
* **Advanced Search:** Filter messages by key, content, partition, or timestamp.
* **Retention & Archiving:** Automated retention policies with manual archiving capabilities.
* **Visual Flow Diagrams:** Visualize how your applications and topics interact.
* **System Health:** Built-in diagnostics for Database and Kafka connectivity.

---

## Quick Start

Choose the installation method that best fits your needs.

### 1. Setup Wizard (Recommended)
Automatically configures the database, secrets, and environment files.

**Windows**
==> scripts\setup.bat

**Linux / macOS**
==> chmod +x scripts/setup.sh
./scripts/setup.sh

2.Docker SetupIdeal for testing or isolated environments.Demo Mode (No external dependencies, uses H2 Database & Embedded Kafka):Bashdocker-compose -f docker-compose.demo.yml up -d --build

Production Mode (Full stack with MySQL & Kafka):Bashdocker-compose up -d --build


3.Manual Setup (Development)For contributors who want to run the stack locally.Environment:Bashcp .env.example .env

# Edit .env with your configuration
Start Backend: --> cd backend
mvn spring-boot:run

Start Frontend: --> cd frontend
npm install
npm run dev

Administrator AccountAccess to the platform is secured. You must create an OWNER account to log in.Use the provided utility script to securely inject an admin user into the database.Note: Ensure your database (or Docker container) is running before executing this script.WindowsPowerShellcd backend

---> create-owner.bat
**Linux / macOS** ==> cd backend
chmod +x create-owner.sh
./create-owner.sh


ConfigurationConfiguration is managed via environment variables in the .env file.VariableDescriptionDefaultSPRING_PROFILES_ACTIVEApplication mode (demo, local, prod)demoDB_URLJDBC Database URLRequired for prodDB_USERNAMEDatabase usernameyucastDB_PASSWORDDatabase passwordyucastJWT_SECRETSecret key for token encryptionRequiredKAFKA_BOOTSTRAP_SERVERSDefault Kafka Connectionlocalhost:9092MAIL_HOSTSMTP Host for notificationssmtp.gmail.comProject Structurebackend/: Spring Boot 3 API (Java 17)frontend/: React 18 + Vitescripts/: Automated setup wizardsdocker/: Container configurationsdocs/: Advanced documentationTech StackBackendSpring Boot 3Spring WebSocketSpring Data JPAApache Kafka ClientFrontendReact 18Vite & TailwindCSSZustand (State Management)RechartsLicenseMIT License - See LICENSE for details.