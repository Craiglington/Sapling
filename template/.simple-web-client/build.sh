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
else 
  echo -e "\n${GREEN}-> Running specs${RESET}"
  if ! npx jasmine-browser-runner runSpecs; then
      echo -e "\n${RED}-> Specs failed!${RESET}"
  fi
fi

echo -e "\n${GREEN}-> Assembling files${RESET}"
mkdir dist
cp -r app/* dist/
mkdir dist/simple-web-client
cp -r .simple-web-client/lib/* dist/simple-web-client
find dist -name "*.ts" -type f -delete

echo -e "\n${GREEN}-> Replacing env file${RESET}"
if ! mv dist/envs/env.build.js dist/envs/env.js; then
    echo -e "\n${RED}-> Failed to replace env file${RESET}"
    exit 1
fi

echo -e "\n${GREEN}-> Build complete! Check the dist directory!${RESET}"