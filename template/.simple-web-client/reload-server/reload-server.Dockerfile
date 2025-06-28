FROM node:lts

WORKDIR /reload-server

COPY ./.simple-web-client/reload-server/src/* .

RUN npm install ws

CMD ["npm", "start"]