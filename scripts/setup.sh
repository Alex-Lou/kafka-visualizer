#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# YUCAST - Setup Script (Linux/Mac)
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
PROJECT_ROOT="$SCRIPT_DIR"
# Si le script est à la racine du projet, PROJECT_ROOT est SCRIPT_DIR.
# Si le script est dans un sous-dossier (ex: scripts/), ajuster ici.

ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
BACKEND_PROPS="$PROJECT_ROOT/backend/src/main/resources/application-local.yml"

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║    ██╗    ██╗██╗    ██╗ ██████╗ █████╗ ███████╗████████╗      ║"
    echo "║    ╚██╗ ██╔╝██║    ██║██╔════╝██╔══██╗██╔════╝╚══██╔══╝      ║"
    echo "║     ╚████╔╝ ██║    ██║██║     ███████║███████╗   ██║          ║"
    echo "║      ╚██╔╝  ██║    ██║██║     ██╔══██║╚════██║   ██║          ║"
    echo "║       ██║   ╚██████╔╝╚██████╗██║  ██║███████║   ██║          ║"
    echo "║       ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝          ║"
    echo "║                                                                   ║"
    echo "║               Kafka Flow Visualizer - Setup Wizard                ║"
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

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local is_password="$4"
    local value

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
    local value

    local hint="y/N"
    [ "$default" = "y" ] && hint="Y/n"

    read -p "$prompt [$hint]: " value
    value="${value:-$default}"
    value=$(echo "$value" | tr '[:upper:]' '[:lower:]')

    if [ "$value" = "y" ] || [ "$value" = "yes" ]; then
        eval "$var_name=0" # 0 means true in bash return codes mostly, but here we use it as int
    else
        eval "$var_name=1"
    fi
}

generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        date +%s | sha256sum | base64 | head -c 64
    fi
}

check_requirements() {
    local missing=()

    if ! command -v java &> /dev/null; then missing+=("Java 17+"); fi
    if ! command -v mvn &> /dev/null; then missing+=("Maven"); fi
    if ! command -v node &> /dev/null; then missing+=("Node.js 18+"); fi
    if ! command -v npm &> /dev/null; then missing+=("npm"); fi

    if [ ${#missing[@]} -gt 0 ]; then
        print_warning "Missing requirements: ${missing[*]}"
        echo -e "  Please install them before running Yucast.\n"
        return 1
    fi
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

TOTAL_STEPS=6

clear
print_banner

print_step 1 "Checking Requirements"
if check_requirements; then
    print_success "All requirements satisfied"
else
    read -p "Continue anyway? [y/N]: " continue_anyway
    if [ "$continue_anyway" != "y" ]; then exit 1; fi
fi

print_step 2 "Choose Installation Mode"
echo "Select your setup mode:"
echo "  1) Demo Mode (Recommended)"
echo "  2) Development Mode"
echo "  3) Production Mode"
echo ""
read -p "Select mode [1/2/3]: " mode_choice
mode_choice="${mode_choice:-1}"

case $mode_choice in
    1) SETUP_MODE="demo"; SPRING_PROFILE="demo"; print_success "Demo Mode selected" ;;
    2) SETUP_MODE="dev"; SPRING_PROFILE="local"; print_success "Development Mode selected" ;;
    3) SETUP_MODE="prod"; SPRING_PROFILE="prod"; print_success "Production Mode selected" ;;
    *) SETUP_MODE="demo"; SPRING_PROFILE="demo"; print_warning "Invalid choice, defaulting to Demo Mode" ;;
esac

print_step 3 "Database Configuration"
if [ "$SETUP_MODE" = "demo" ]; then
    DB_URL="jdbc:h2:mem:yucast-demo;DB_CLOSE_DELAY=-1"
    DB_USERNAME="sa"
    DB_PASSWORD=""
    print_info "Using embedded H2 database"
else
    prompt_with_default "Database URL" "jdbc:mysql://localhost:3306/yucast?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" "DB_URL"
    prompt_with_default "Database Username" "yucast" "DB_USERNAME"
    prompt_with_default "Database Password" "" "DB_PASSWORD" "true"
fi

print_step 4 "Kafka Configuration"
if [ "$SETUP_MODE" = "demo" ]; then
    KAFKA_BOOTSTRAP="localhost:9092"
    KAFKA_SECURITY="PLAINTEXT"
else
    prompt_yes_no "Configure default Kafka?" "y" "add_kafka"
    if [ $add_kafka -eq 0 ]; then
        prompt_with_default "Bootstrap Servers" "localhost:9092" "KAFKA_BOOTSTRAP"
        # Simplification for brevity, assume PLAINTEXT by default or ask
        KAFKA_SECURITY="PLAINTEXT"
    else
        KAFKA_BOOTSTRAP=""
    fi
fi

print_step 5 "Email Configuration"
if [ "$SETUP_MODE" = "prod" ]; then
    prompt_with_default "SMTP Host" "smtp.gmail.com" "MAIL_HOST"
    prompt_with_default "SMTP Port" "587" "MAIL_PORT"
else
    MAIL_HOST=""; MAIL_PORT=""
    print_info "Skipped email configuration"
fi

print_step 6 "Generating Configuration"
JWT_SECRET=$(generate_secret)

# Create .env
cat > "$ENV_FILE" << EOF
SPRING_PROFILES_ACTIVE=$SPRING_PROFILE
DEMO_MODE=$([ "$SETUP_MODE" = "demo" ] && echo "true" || echo "false")
DB_URL=$DB_URL
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
KAFKA_BOOTSTRAP_SERVERS=$KAFKA_BOOTSTRAP
KAFKA_SECURITY_PROTOCOL=${KAFKA_SECURITY:-PLAINTEXT}
MAIL_HOST=$MAIL_HOST
MAIL_PORT=$MAIL_PORT
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
print_success "Created .env file"

# Create application-local.yml
mkdir -p "$(dirname "$BACKEND_PROPS")"
cat > "$BACKEND_PROPS" << EOF
spring:
  datasource:
    url: \${DB_URL}
    username: \${DB_USERNAME}
    password: \${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
app:
  jwt-secret: \${JWT_SECRET}
  demo-mode: \${DEMO_MODE:false}
cors:
  allowed-origins: \${CORS_ALLOWED_ORIGINS}
EOF
print_success "Created backend config"

echo ""
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "Run backend: ${CYAN}cd backend && mvn spring-boot:run${NC}"
echo -e "Run frontend: ${CYAN}cd frontend && npm install && npm run dev${NC}"