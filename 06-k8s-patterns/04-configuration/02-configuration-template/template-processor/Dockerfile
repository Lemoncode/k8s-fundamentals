FROM node:carbon-alpine

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_ENV production

COPY package.json /home/node/app/package.json
COPY config.js /home/node/app/config.js 
COPY app-dev.config.json /home/node/app/app-dev.config.json
COPY index.js /home/node/app/index.js

RUN chown -R node:node /home/node/app 

USER node
WORKDIR /home/node/app

# EXPOSE 3000

CMD node index.js
#CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
