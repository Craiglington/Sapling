#!/bin/bash
GREEN='\033[0;32m'
RESET='\033[0m'

echo -e "\n${GREEN}-> Pruning docker!${RESET}"
docker system prune -f

echo -e "\n${GREEN}-> Starting docker!${RESET}"
docker compose up --build --watch