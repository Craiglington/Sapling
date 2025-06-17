FROM nginx:latest

COPY ./.simple-web-client/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY ./app/ /html/
COPY ./.simple-web-client/nginx/src/client-listener.js /html/client-listener.js
COPY ./.simple-web-client/nginx/src/reload.sh .
COPY ./.simple-web-client/lib/ /html/simple-web-client