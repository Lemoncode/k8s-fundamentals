FROM node:18-alpine

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_ENV production

COPY package.json /home/node/app/package.json
COPY package-lock.json /home/node/app/package-lock.json
COPY mock-db.service.js /home/node/app/mock-db.service.js
COPY mock-todo-collection.json /home/node/app/mock-todo-collection.json
COPY db.service.js /home/node/app/db.service.js
COPY server.js /home/node/app/server.js

RUN chown -R node:node /home/node/app 

USER node
WORKDIR /home/node/app
RUN npm ci --only-production

EXPOSE 3000

CMD node server.js
#CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
