#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "\n${GREEN}-> Running prettier${RESET}"
if ! npx prettier . --write; then
    echo -e "\n${RED}-> Failed to run prettier${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Compiling src${RESET}"
rm -rf dist
if ! npx tsc; then
    echo -e "\n${RED}-> Failed to compile src${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Transferring src${RESET}"
rm -rf ../template/.simple-web-client/reload-server/src/**/*.js
if ! cp -r dist/* ../template/.simple-web-client/reload-server/src/; then
    echo -e "\n${RED}-> Failed to transfer src${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Successfully transferred reload-server to template${RESET}"