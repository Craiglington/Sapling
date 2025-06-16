FROM nginx:latest

COPY ./.simple-web-client/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY ./app/ /html/
COPY ./.simple-web-client/nginx/scripts/client-listener.js /html/client-listener.js
COPY ./.simple-web-client/nginx/scripts/reload.sh .