FROM node:carbon-alpine

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_ENV production

COPY package.json /home/node/app/package.json
COPY package-lock.json /home/node/app/package-lock.json
COPY config-reader.service.js /home/node/app/config-reader.service.js
COPY start-server.js /home/node/app/start-server.js
COPY server.js /home/node/app/server.js

RUN chown -R node:node /home/node/app 

USER node
WORKDIR /home/node/app
RUN npm ci

EXPOSE 3000

CMD node server.js
#CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
