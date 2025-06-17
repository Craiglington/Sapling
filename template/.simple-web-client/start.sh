#!/bin/sh
GREEN='\033[0;32m'
RESET='\033[0m'

echo -e "\n${GREEN}-> Starting development server!${RESET}"
npx tsc --watch & docker compose -f compose.yaml up --build --watch