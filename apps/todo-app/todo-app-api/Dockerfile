FROM node:18-alpine

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_ENV production

COPY src/ /home/node/app
COPY package.json /home/node/app/package.json
COPY package-lock.json /home/node/app/package-lock.json

RUN chown -R node:node /home/node/app 

USER node
WORKDIR /home/node/app
RUN npm ci --only-production

EXPOSE 3000

CMD node server.js
#CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
