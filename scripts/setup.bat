#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# YUCAST - Setup Script
# ═══════════════════════════════════════════════════════════════════════════════
# This script helps you configure Yucast for first-time use.
# It will create the necessary configuration files and environment variables.
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
BACKEND_PROPS="$BACKEND_DIR/src/main/resources/application-local.yml"

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   ██╗   ██╗██╗   ██╗ ██████╗ █████╗ ███████╗████████╗            ║"
    echo "║   ╚██╗ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝╚══██╔══╝            ║"
    echo "║    ╚████╔╝ ██║   ██║██║     ███████║███████╗   ██║               ║"
    echo "║     ╚██╔╝  ██║   ██║██║     ██╔══██║╚════██║   ██║               ║"
    echo "║      ██║   ╚██████╔╝╚██████╗██║  ██║███████║   ██║               ║"
    echo "║      ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝               ║"
    echo "║                                                                   ║"
    echo "║              Kafka Flow Visualizer - Setup Wizard                 ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}${BOLD}[$1/${TOTAL_STEPS}]${NC} ${BOLD}$2${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local is_password="$4"

    if [ "$is_password" = "true" ]; then
        read -sp "$prompt [$default]: " value
        echo
    else
        read -p "$prompt [$default]: " value
    fi

    value="${value:-$default}"
    eval "$var_name='$value'"
}

prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"

    local hint="y/N"
    [ "$default" = "y" ] && hint="Y/n"

    read -p "$prompt [$hint]: " value
    value="${value:-$default}"
    value=$(echo "$value" | tr '[:upper:]' '[:lower:]')

    [ "$value" = "y" ] || [ "$value" = "yes" ]
    eval "$var_name=$?"
}

generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    elif command -v uuidgen &> /dev/null; then
        uuidgen | sha256sum | head -c 64
    else
        date +%s | sha256sum | base64 | head -c 64
    fi
}

check_requirements() {
    local missing=()

    if ! command -v java &> /dev/null; then
        missing+=("Java 17+")
    fi

    if ! command -v mvn &> /dev/null; then
        missing+=("Maven")
    fi

    if ! command -v node &> /dev/null; then
        missing+=("Node.js 18+")
    fi

    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        print_warning "Missing requirements: ${missing[*]}"
        echo -e "  Please install them before running Yucast.\n"
        return 1
    fi

    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════

TOTAL_STEPS=6

clear
print_banner

echo -e "${BOLD}Welcome to the Yucast Setup Wizard!${NC}"
echo "This will help you configure Yucast for your environment."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Check Requirements
# ─────────────────────────────────────────────────────────────────────────────

print_step 1 "Checking Requirements"

if check_requirements; then
    print_success "All requirements satisfied"
    java_version=$(java -version 2>&1 | head -n 1)
    node_version=$(node --version)
    print_info "Java: $java_version"
    print_info "Node: $node_version"
else
    echo ""
    read -p "Continue anyway? [y/N]: " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Choose Mode
# ─────────────────────────────────────────────────────────────────────────────

print_step 2 "Choose Installation Mode"

echo "Select your setup mode:"
echo ""
echo "  ${BOLD}1)${NC} ${GREEN}Demo Mode${NC} (Recommended for first time)"
echo "     - Uses embedded H2 database"
echo "     - Includes sample Kafka connection"
echo "     - No external dependencies"
echo ""
echo "  ${BOLD}2)${NC} ${BLUE}Development Mode${NC}"
echo "     - Uses MySQL database"
echo "     - Full configuration options"
echo "     - For local development"
echo ""
echo "  ${BOLD}3)${NC} ${YELLOW}Production Mode${NC}"
echo "     - Secure configuration"
echo "     - External database required"
echo "     - Email notifications enabled"
echo ""

read -p "Select mode [1/2/3]: " mode_choice
mode_choice="${mode_choice:-1}"

case $mode_choice in
    1)
        SETUP_MODE="demo"
        SPRING_PROFILE="demo"
        print_success "Demo Mode selected"
        ;;
    2)
        SETUP_MODE="dev"
        SPRING_PROFILE="local"
        print_success "Development Mode selected"
        ;;
    3)
        SETUP_MODE="prod"
        SPRING_PROFILE="prod"
        print_success "Production Mode selected"
        ;;
    *)
        SETUP_MODE="demo"
        SPRING_PROFILE="demo"
        print_warning "Invalid choice, defaulting to Demo Mode"
        ;;
esac

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Database Configuration
# ─────────────────────────────────────────────────────────────────────────────

print_step 3 "Database Configuration"

if [ "$SETUP_MODE" = "demo" ]; then
    DB_TYPE="h2"
    DB_URL="jdbc:h2:mem:yucast-demo;DB_CLOSE_DELAY=-1"
    DB_USERNAME="sa"
    DB_PASSWORD=""
    print_info "Using embedded H2 database (no configuration needed)"
else
    echo "Select database type:"
    echo "  1) MySQL (default)"
    echo "  2) PostgreSQL"
    echo "  3) H2 (embedded)"
    echo ""
    read -p "Select [1/2/3]: " db_choice

    case $db_choice in
        2)
            DB_TYPE="postgresql"
            DB_DRIVER="org.postgresql.Driver"
            DB_DEFAULT_URL="jdbc:postgresql://localhost:5432/yucast"
            ;;
        3)
            DB_TYPE="h2"
            DB_DRIVER="org.h2.Driver"
            DB_DEFAULT_URL="jdbc:h2:file:./data/yucast;DB_CLOSE_DELAY=-1"
            ;;
        *)
            DB_TYPE="mysql"
            DB_DRIVER="com.mysql.cj.jdbc.Driver"
            DB_DEFAULT_URL="jdbc:mysql://localhost:3306/yucast?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
            ;;
    esac

    echo ""
    prompt_with_default "Database URL" "$DB_DEFAULT_URL" "DB_URL"
    prompt_with_default "Database Username" "yucast" "DB_USERNAME"
    prompt_with_default "Database Password" "" "DB_PASSWORD" "true"

    print_success "Database configured: $DB_TYPE"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Kafka Configuration
# ─────────────────────────────────────────────────────────────────────────────

print_step 4 "Kafka Configuration (Optional)"

if [ "$SETUP_MODE" = "demo" ]; then
    KAFKA_BOOTSTRAP="localhost:9092"
    print_info "Default Kafka: localhost:9092"
    print_info "You can add connections later in the UI"
else
    echo "Configure a default Kafka connection?"
    prompt_yes_no "Add default Kafka connection?" "y" "add_kafka"

    if [ $add_kafka -eq 0 ]; then
        prompt_with_default "Kafka Bootstrap Servers" "localhost:9092" "KAFKA_BOOTSTRAP"

        echo ""
        echo "Security protocol:"
        echo "  1) PLAINTEXT (no auth)"
        echo "  2) SASL_PLAINTEXT"
        echo "  3) SASL_SSL"
        echo ""
        read -p "Select [1/2/3]: " kafka_security

        case $kafka_security in
            2)
                KAFKA_SECURITY="SASL_PLAINTEXT"
                prompt_with_default "SASL Username" "" "KAFKA_USERNAME"
                prompt_with_default "SASL Password" "" "KAFKA_PASSWORD" "true"
                ;;
            3)
                KAFKA_SECURITY="SASL_SSL"
                prompt_with_default "SASL Username" "" "KAFKA_USERNAME"
                prompt_with_default "SASL Password" "" "KAFKA_PASSWORD" "true"
                ;;
            *)
                KAFKA_SECURITY="PLAINTEXT"
                KAFKA_USERNAME=""
                KAFKA_PASSWORD=""
                ;;
        esac

        print_success "Kafka configured: $KAFKA_BOOTSTRAP ($KAFKA_SECURITY)"
    else
        KAFKA_BOOTSTRAP=""
        print_info "Skipped - you can add connections in the UI"
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Email Configuration (Production only)
# ─────────────────────────────────────────────────────────────────────────────

print_step 5 "Email Configuration (Optional)"

if [ "$SETUP_MODE" = "prod" ]; then
    prompt_yes_no "Configure email notifications?" "n" "add_email"

    if [ $add_email -eq 0 ]; then
        prompt_with_default "SMTP Host" "smtp.gmail.com" "MAIL_HOST"
        prompt_with_default "SMTP Port" "587" "MAIL_PORT"
        prompt_with_default "Email Username" "" "MAIL_USERNAME"
        prompt_with_default "Email Password (App Password)" "" "MAIL_PASSWORD" "true"
        print_success "Email configured"
    else
        MAIL_HOST=""
        MAIL_PORT=""
        MAIL_USERNAME=""
        MAIL_PASSWORD=""
        print_info "Email notifications disabled"
    fi
else
    MAIL_HOST=""
    MAIL_PORT=""
    MAIL_USERNAME=""
    MAIL_PASSWORD=""
    print_info "Email configuration skipped (not needed for $SETUP_MODE mode)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Generate Configuration Files
# ─────────────────────────────────────────────────────────────────────────────

print_step 6 "Generating Configuration Files"

# Generate JWT Secret
JWT_SECRET=$(generate_secret)
print_success "Generated secure JWT secret"

# Create .env file
cat > "$ENV_FILE" << EOF
# ═══════════════════════════════════════════════════════════════════════════════
# YUCAST - Environment Configuration
# Generated on $(date)
# ═══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# Application Mode
# ─────────────────────────────────────────────────────────────────────────────
SPRING_PROFILES_ACTIVE=$SPRING_PROFILE
DEMO_MODE=$([ "$SETUP_MODE" = "demo" ] && echo "true" || echo "false")

# ─────────────────────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────────────────────
DB_URL=$DB_URL
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

# ─────────────────────────────────────────────────────────────────────────────
# Security
# ─────────────────────────────────────────────────────────────────────────────
JWT_SECRET=$JWT_SECRET

# ─────────────────────────────────────────────────────────────────────────────
# Kafka (Default Connection)
# ─────────────────────────────────────────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS=$KAFKA_BOOTSTRAP
KAFKA_SECURITY_PROTOCOL=${KAFKA_SECURITY:-PLAINTEXT}
KAFKA_SASL_USERNAME=${KAFKA_USERNAME:-}
KAFKA_SASL_PASSWORD=${KAFKA_PASSWORD:-}

# ─────────────────────────────────────────────────────────────────────────────
# Email (Optional)
# ─────────────────────────────────────────────────────────────────────────────
MAIL_HOST=${MAIL_HOST:-}
MAIL_PORT=${MAIL_PORT:-587}
MAIL_USERNAME=${MAIL_USERNAME:-}
MAIL_PASSWORD=${MAIL_PASSWORD:-}

# ─────────────────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

print_success "Created .env file"

# Create .env.example if it doesn't exist
if [ ! -f "$ENV_EXAMPLE" ]; then
    cat > "$ENV_EXAMPLE" << 'EOF'
# ═══════════════════════════════════════════════════════════════════════════════
# YUCAST - Environment Configuration Template
# Copy this file to .env and fill in your values
# ═══════════════════════════════════════════════════════════════════════════════

# Application Mode: demo, local, prod
SPRING_PROFILES_ACTIVE=demo
DEMO_MODE=true

# Database
DB_URL=jdbc:mysql://localhost:3306/yucast
DB_USERNAME=yucast
DB_PASSWORD=your_password_here

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=change-me-generate-a-secure-random-string

# Kafka (optional - can configure in UI)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_SECURITY_PROTOCOL=PLAINTEXT
KAFKA_SASL_USERNAME=
KAFKA_SASL_PASSWORD=

# Email (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
EOF
    print_success "Created .env.example template"
fi

# Create application-local.yml for backend
mkdir -p "$(dirname "$BACKEND_PROPS")"
cat > "$BACKEND_PROPS" << EOF
# ═══════════════════════════════════════════════════════════════════════════════
# YUCAST - Local Configuration
# This file is auto-generated by setup.sh - DO NOT COMMIT
# ═══════════════════════════════════════════════════════════════════════════════

spring:
  datasource:
    url: \${DB_URL}
    username: \${DB_USERNAME}
    password: \${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

  mail:
    host: \${MAIL_HOST:}
    port: \${MAIL_PORT:587}
    username: \${MAIL_USERNAME:}
    password: \${MAIL_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

app:
  jwt-secret: \${JWT_SECRET}
  demo-mode: \${DEMO_MODE:false}

cors:
  allowed-origins: \${CORS_ALLOWED_ORIGINS:http://localhost:5173}
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true

logging:
  level:
    com.kafkaflow.visualizer: DEBUG
EOF

print_success "Created backend configuration"

# Update .gitignore
GITIGNORE_FILE="$PROJECT_ROOT/.gitignore"
if [ -f "$GITIGNORE_FILE" ]; then
    # Check if entries already exist
    if ! grep -q "^\.env$" "$GITIGNORE_FILE"; then
        echo "" >> "$GITIGNORE_FILE"
        echo "# Secrets (added by setup.sh)" >> "$GITIGNORE_FILE"
        echo ".env" >> "$GITIGNORE_FILE"
        echo "application-local.yml" >> "$GITIGNORE_FILE"
        echo "application-prod.yml" >> "$GITIGNORE_FILE"
        echo "*.local.yml" >> "$GITIGNORE_FILE"
        print_success "Updated .gitignore"
    else
        print_info ".gitignore already configured"
    fi
else
    cat > "$GITIGNORE_FILE" << 'EOF'
# Secrets
.env
application-local.yml
application-prod.yml
*.local.yml

# IDE
.idea/
*.iml
.vscode/
*.swp
*.swo

# Build
target/
node_modules/
dist/
build/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Test
coverage/
*.lcov
EOF
    print_success "Created .gitignore"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    ✓ Setup Complete!                                   ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}Configuration Summary:${NC}"
echo -e "  Mode:     ${CYAN}$SETUP_MODE${NC}"
echo -e "  Profile:  ${CYAN}$SPRING_PROFILE${NC}"
echo -e "  Database: ${CYAN}$DB_TYPE${NC}"
echo ""
echo -e "${BOLD}Files Created:${NC}"
echo -e "  ${GREEN}✓${NC} .env"
echo -e "  ${GREEN}✓${NC} .env.example"
echo -e "  ${GREEN}✓${NC} backend/src/main/resources/application-local.yml"
echo -e "  ${GREEN}✓${NC} .gitignore (updated)"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""

if [ "$SETUP_MODE" = "demo" ]; then
    echo -e "  ${YELLOW}1.${NC} Start the demo Kafka (optional):"
    echo -e "     ${CYAN}docker-compose -f demo/docker-compose.yml up -d${NC}"
    echo ""
fi

echo -e "  ${YELLOW}$( [ "$SETUP_MODE" = "demo" ] && echo "2" || echo "1" ).${NC} Start the backend:"
echo -e "     ${CYAN}cd backend && mvn spring-boot:run${NC}"
echo ""
echo -e "  ${YELLOW}$( [ "$SETUP_MODE" = "demo" ] && echo "3" || echo "2" ).${NC} Start the frontend:"
echo -e "     ${CYAN}cd frontend && npm install && npm run dev${NC}"
echo ""
echo -e "  ${YELLOW}$( [ "$SETUP_MODE" = "demo" ] && echo "4" || echo "3" ).${NC} Open your browser:"
echo -e "     ${CYAN}http://localhost:5173${NC}"
echo ""
echo -e "${BOLD}Documentation:${NC}"
echo -e "  README:        ${CYAN}$PROJECT_ROOT/README.md${NC}"
echo -e "  Configuration: ${CYAN}$PROJECT_ROOT/docs/CONFIGURATION.md${NC}"
echo ""
echo -e "${YELLOW}⚠ Important:${NC} Never commit .env file to version control!"
echo ""