FROM nginx:latest

COPY ./.simple-web-client/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY ./app/ /html/
COPY ./.simple-web-client/nginx/src/* /html/
COPY ./.simple-web-client/nginx/src/reload.sh .
COPY ./.simple-web-client/lib/ /html/simple-web-client

ENV RELOAD_CONTAINER="reload-server"
ENV RELOAD_PORT="8080"
ENV RELOAD_PATH="reload"