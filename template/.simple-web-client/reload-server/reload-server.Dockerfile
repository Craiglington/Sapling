FROM node:lts

WORKDIR /reload-server

COPY ./.simple-web-client/reload-server/src/reload-server.js .

RUN npm install ws

CMD ["node", "reload-server.js"]