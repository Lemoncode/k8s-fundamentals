FROM node:14-alpine3.12 as build

WORKDIR /opt/build

ARG TODO_APP_API={{TODO_APP_API}}
ARG TODO_APP_TITLE={{TODO_APP_TITLE}}

COPY ./src ./src

COPY .babelrc .

COPY *.json ./

COPY webpack.config.js .

RUN npm ci 

RUN npm run build

FROM nginx:alpine as app

COPY nginx.conf /etc/nginx/nginx.conf 

WORKDIR /usr/share/nginx/html
COPY --from=build /opt/build/dist/ .

EXPOSE 8080

COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh
ENTRYPOINT [ "sh", "/entry-point.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]