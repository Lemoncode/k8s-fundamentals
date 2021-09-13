FROM node:14.17.0 as builder

ARG API_MOCK=true

WORKDIR /opt/app

COPY . .

RUN npm ci

RUN npm run build

FROM nginx:alpine

COPY --from=builder /opt/app/dist /usr/share/nginx/html
COPY ./.docker/config/nginx.conf /etc/nginx/conf.d/default.conf

