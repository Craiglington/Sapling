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

echo -e "\n${GREEN}-> Compiling specs${RESET}"
rm -rf spec/dist
if ! npx tsc -p spec; then
    echo -e "\n${RED}-> Failed to compile specs${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Running specs${RESET}"
if ! npx jasmine-browser-runner runSpecs; then
    echo -e "\n${RED}-> Specs failed${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Transferring src${RESET}"
rm -rf ../template/.simple-web-client/lib/*
if ! cp -r dist/* ../template/.simple-web-client/lib/; then
    echo -e "\n${RED}-> Failed to transfer src${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Successfully transferred lib to template${RESET}"