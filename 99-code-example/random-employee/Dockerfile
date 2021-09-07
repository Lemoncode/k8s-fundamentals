FROM node:alpine3.12 AS builder

WORKDIR /tmp/build  

COPY app.ts .

COPY config.ts .

COPY employee-generator.service.ts .

COPY routes.ts .

COPY package*.json .

COPY tsconfig.json .

RUN npm ci 

RUN npm run build

FROM node:alpine3.12 AS app

WORKDIR /opt/app

COPY --from=builder /tmp/build/dist .

COPY --from=builder /tmp/build/package*.json .

RUN npm ci --only-production

CMD [ "node", "app.js" ]


