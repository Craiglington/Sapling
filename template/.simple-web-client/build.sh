#!/bin/bash
GREEN='\033[0;32m'
RESET='\033[0m'

echo -e "\n${GREEN}-> Clearing dist directory${RESET}"
rm -rf dist

echo -e "\n${GREEN}-> Running Prettier${RESET}"
npx prettier . --write

echo -e "\n${GREEN}-> Compiling TypeScript${RESET}"
npx tsc

echo -e "\n${GREEN}-> Assembling files${RESET}"
mkdir dist
cp -r app/* dist/
mkdir dist/simple-web-client
cp -r .simple-web-client/lib/* dist/simple-web-client
find dist -name "*.ts" -type f -delete

echo -e "\n${GREEN}-> Replacing env${RESET}"
mv dist/envs/env.build.js dist/envs/env.js

echo -e "\n${GREEN}-> Removing client listener${RESET}"
sed -i 's;<script type="module" src="/client-listener.js"></script>;;g' dist/index.html

echo -e "\n${GREEN}-> Build complete! Check the dist directory!${RESET}"