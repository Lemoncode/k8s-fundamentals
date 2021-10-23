# FROM node:carbon-alpine
FROM node:14.18.0-alpine

COPY config.js .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN npm ci 

CMD [ "node", "server.js" ]