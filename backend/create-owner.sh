#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║             Create OWNER Account (Linux/Mac)             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "This script will add a new Admin/Owner to the database."
echo ""

# 1. Demande des infos
read -p "Enter Username: " USERNAME
read -p "Enter Email (optional): " EMAIL
read -s -p "Enter Password: " PASSWORD
echo ""
echo ""

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}Error: Username and Password are required.${NC}"
    exit 1
fi

echo -e "${BLUE}Running Spring Boot to inject user... Please wait...${NC}"
echo "(This might take a few seconds to initialize the database connection)"

# 2. Lancement de Maven avec les arguments spécifiques
# On passe les infos en propriétés système (-D)
mvn spring-boot:run \
    -Dspring-boot.run.jvmArguments="\
    -Dapp.setup.mode=true \
    -Dapp.setup.username=$USERNAME \
    -Dapp.setup.password=$PASSWORD \
    -Dapp.setup.email=$EMAIL" \
    -q -Dspring-boot.run.noverify=true

# Le flag -q (quiet) réduit le bruit de Maven, mais on verra les logs de l'app

echo ""
echo -e "${GREEN}Done.${NC}"