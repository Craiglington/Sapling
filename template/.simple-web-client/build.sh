#!/bin/sh
GREEN='\033[0;32m'
RESET='\033[0m'

echo -e "\n${GREEN}-> Clearing dist directory${RESET}"
rm -rf .simple-web-client/dist
rm -rf app/dist

echo -e "\n${GREEN}-> Running Prettier${RESET}"
npx prettier . --write

echo -e "\n${GREEN}-> Compiling TypeScript${RESET}"
npx tsc

echo -e "\n${GREEN}-> Assembling files${RESET}"
mkdir .simple-web-client/dist
cp -r app/* .simple-web-client/dist/
rm -rf .simple-web-client/dist/src

echo -e "\n${GREEN}-> Replacing env${RESET}"
mv .simple-web-client/dist/dist/envs/env.build.js .simple-web-client/dist/dist/envs/env.js

echo -e "\n${GREEN}-> Removing client listener${RESET}"
sed -i 's;<script type="module" src="./client-listener.js"></script>;;g' .simple-web-client/dist/index.html

echo -e "\n${GREEN}-> Build complete! Check the .simple-web-client/dist directory!${RESET}"