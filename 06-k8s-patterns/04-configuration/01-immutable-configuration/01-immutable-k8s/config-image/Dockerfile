FROM alpine

COPY app-dev.config.json /config-src/app-dev.config.json

ENTRYPOINT [ "sh", "-c", "cp /config-src/* $1", "--" ]