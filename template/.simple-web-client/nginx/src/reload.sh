#!/bin/bash
GREEN='\033[0;32m'
RESET='\033[0m'

# Send reload request
echo -e "\n${GREEN}-> Sending reload request${RESET}"
curl -X POST http://reload-server:8080/reload