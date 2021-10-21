FROM node:alpine3.12 AS builder

WORKDIR /tmp/build  

COPY . .

RUN npm ci 

RUN npm run build

FROM node:alpine3.12 AS app

WORKDIR /opt/app

COPY --from=builder /tmp/build/dist .

COPY --from=builder /tmp/build/package.json .

COPY --from=builder /tmp/build/package-lock.json .

RUN npm ci --only-production

CMD [ "node", "app.js" ]
